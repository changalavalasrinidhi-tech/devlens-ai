"""Automated verification suite for DevLens backend.

Tests:
1. Static code parsing of Python and TypeScript/JavaScript.
2. Extraction of classes, functions, routes, and dependencies.
3. Heuristic and AI architectural analyzer.
4. FastAPI endpoints (/health, /test-sample, /parse-repo with ZIP upload).
"""

from __future__ import annotations

import io
import zipfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from analyzer import CodebaseAnalyzer
from main import app
from parser import RepoParser


@pytest.fixture
def sample_data():
    sample_dir = Path(__file__).parent / "test_samples"
    parser = RepoParser(sample_dir)
    result = parser.parse()
    return result.to_dict()


def test_parser_on_samples():
    print("--- 1. Testing RepoParser on test_samples ---")
    sample_dir = Path(__file__).parent / "test_samples"
    parser = RepoParser(sample_dir)
    result = parser.parse()
    data = result.to_dict()

    stats = data["summary_stats"]
    print(f"Total files scanned: {stats['total_files_scanned']}")
    print(f"Total lines of code: {stats['total_lines_of_code']}")
    print(f"Languages: {stats['languages']}")
    print(f"Total routes detected: {stats['total_routes_detected']}")
    print(f"Total dependencies detected: {stats['total_dependencies_detected']}")

    assert stats["total_files_scanned"] >= 2, "Should scan at least 2 code files"
    assert "python" in stats["languages"]
    assert "typescript" in stats["languages"]

    # Check routes
    routes = data["routes"]
    paths = [r["path"] for r in routes]
    print(f"Detected route paths: {paths}")
    assert any("/api/items" in p for p in paths), "Should detect /api/items route"

    # Check dependencies
    deps = [d["name"].lower() for d in data["dependencies"]]
    print(f"Detected dependencies: {deps}")
    assert "fastapi" in deps, "Should detect fastapi dependency"
    assert "react" in deps, "Should detect react dependency"

    print("[OK] RepoParser tests passed!\n")


def test_analyzer(sample_data):
    print("--- 2. Testing CodebaseAnalyzer ---")
    analyzer = CodebaseAnalyzer()
    analysis = analyzer.analyze(sample_data)

    print(f"Architecture style: {analysis.get('architecture_style')}")
    print(f"Tech stack: {analysis.get('tech_stack')}")
    print(f"Data flows count: {len(analysis.get('data_flows', []))}")
    print(f"Diagram nodes count: {len(analysis.get('suggested_diagram_nodes', []))}")
    print(f"Diagram edges count: {len(analysis.get('suggested_diagram_edges', []))}")
    print(f"Analysis source: {analysis.get('analysis_source')}")

    assert "summary" in analysis
    assert "architecture_style" in analysis
    assert "tech_stack" in analysis
    assert len(analysis["suggested_diagram_nodes"]) > 0
    assert len(analysis["data_flows"]) > 0

    print("[OK] CodebaseAnalyzer tests passed!\n")


def test_fastapi_endpoints():
    print("--- 3. Testing FastAPI REST Endpoints ---")
    client = TestClient(app)

    # 1. Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json() == {"status": "ok", "service": "devlens"}
    print("[OK] GET /health: 200 OK")

    # 2. Test sample endpoint
    res_sample = client.get("/test-sample")
    assert res_sample.status_code == 200
    data_sample = res_sample.json()
    assert data_sample["status"] == "success"
    assert "summary_stats" in data_sample
    assert "ai_analysis" in data_sample
    print("[OK] GET /test-sample: 200 OK")

    # 3. Zip file upload to /parse-repo
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "microservice/main.py",
            "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get('/ping')\ndef ping():\n    return {'ping': 'pong'}\n",
        )
        zf.writestr("microservice/requirements.txt", "fastapi>=0.100.0\npytest\n")

    zip_buffer.seek(0)
    files = {"file": ("repo_test.zip", zip_buffer.getvalue(), "application/zip")}
    res_upload = client.post("/parse-repo", files=files)

    assert res_upload.status_code == 200, f"Upload failed: {res_upload.text}"
    upload_json = res_upload.json()
    assert upload_json["status"] == "success"
    assert any(r["path"] == "/ping" for r in upload_json["routes"])
    assert any(d["name"] == "fastapi" for d in upload_json["dependencies"])
    print("[OK] POST /parse-repo (ZIP Upload): 200 OK")

    # 4. Bad request check (no parameters)
    res_empty = client.post("/parse-repo")
    assert res_empty.status_code == 400
    print("[OK] POST /parse-repo (Empty Request): 400 Bad Request as expected")

    print("\n[OK] ALL DEVLENS TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_parser_on_samples()
    sample_dir = Path(__file__).parent / "test_samples"
    data = RepoParser(sample_dir).parse().to_dict()
    test_analyzer(data)
    test_fastapi_endpoints()
