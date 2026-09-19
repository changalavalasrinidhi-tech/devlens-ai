# DevLens - AI-Powered Code Parser & Flow Visualizer Backend

DevLens is a fast, lightweight Python backend built with **FastAPI** for a 24-hour hackathon. It ingests code repositories from **public GitHub URLs** or **uploaded ZIP files**, performs recursive directory traversal and static code analysis (extracting classes, functions, API routes, and dependencies), and uses **Google Gemini 3.8 Flash** (with instant offline heuristic fallback) to generate architectural summaries and data-flow diagram specs.

---

## Features

- **Fast & Lightweight REST API**: Built on FastAPI with asynchronous request handling and CORS enabled for any frontend client (React, Vue, Next.js).
- **Multi-Source Ingestion**:
  - **ZIP Upload**: Direct file drag-and-drop or multipart upload with safe zip-slip extraction.
  - **GitHub URL**: Direct stream download of public repository zipballs without requiring local `git` CLI installation.
- **Deep Static Analysis**:
  - **Python**: AST-based parsing of classes, methods, functions, and FastAPI/Flask route decorators (`@app.get`, `@router.post`, etc.).
  - **JavaScript & TypeScript**: Regex extraction of functions, arrow functions, classes, Express route handlers, and client-side API calls (`fetch`, `axios`).
  - **Dependency Extraction**: Automatic parsing of `requirements.txt` and `package.json`.
- **AI Architectural & Flow Analyzer**:
  - Integrates with the official `google-genai` SDK using `gemini-3.8-flash`.
  - Generates JSON architectural summaries, data-flow steps, and diagram nodes & edges.
  - Built-in heuristic fallback engine ensuring 100% demo reliability even without an API key or internet access.
- **Interactive Swagger Docs**: Auto-generated interactive API documentation at `/docs`.

---

## Directory Structure

```
.
├── main.py                        # FastAPI application entrypoint & REST endpoints
├── parser.py                      # AST/regex static code parser & directory walker
├── analyzer.py                    # Gemini AI & heuristic architectural flow analyzer
├── requirements.txt               # Backend dependencies
├── test_samples/                  # Pre-bundled demo repository (FastAPI + React/TS)
│   ├── backend/
│   │   ├── app.py
│   │   └── requirements.txt
│   └── frontend/
│       ├── package.json
│       └── src/
│           └── api.ts
├── test_devlens.py                # Automated integration test suite
└── README.md                      # Documentation
```

---

## Quick Start

### 1. Set Up Virtual Environment

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. (Optional) Set Google Gemini API Key

If you have a Gemini API key, set it as an environment variable. If omitted, DevLens automatically activates its intelligent heuristic engine:

```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_api_key_here"

# Linux / macOS
export GEMINI_API_KEY="your_api_key_here"
```

### 4. Run the DevLens Backend

```bash
uvicorn main:app --reload --port 8000
```

The server will start at:
- **API Root**: http://127.0.0.1:8000/
- **Interactive Swagger UI**: http://127.0.0.1:8000/docs
- **Instant Sample Test**: http://127.0.0.1:8000/test-sample

---

## API Endpoints

### 1. `POST /parse-repo`
Parses a repository from an uploaded ZIP archive or a GitHub URL.

**Form Data:**
- `file`: (Optional) `.zip` archive containing the code.
- `github_url`: (Optional) Public GitHub repository URL (e.g. `https://github.com/fastapi/fastapi`).

**Example with cURL (ZIP upload):**
```bash
curl -X POST "http://127.0.0.1:8000/parse-repo" \
  -F "file=@my_codebase.zip"
```

**Example with cURL (GitHub URL):**
```bash
curl -X POST "http://127.0.0.1:8000/parse-repo" \
  -F "github_url=https://github.com/encode/starlette"
```

---

### 2. `POST /parse-repo-json`
JSON endpoint for automated pipelines or frontend clients sending GitHub URLs.

**Request Body:**
```json
{
  "github_url": "https://github.com/pallets/flask"
}
```

---

### 3. `GET /test-sample`
Instant test endpoint that parses the pre-bundled test repository (`test_samples/`) without requiring any uploads or internet connection.

---

### 4. `GET /health`
Returns health check status:
```json
{
  "status": "ok",
  "service": "devlens"
}
```

---

## Example Response Payload

```json
{
  "status": "success",
  "source": "https://github.com/example/demo",
  "summary_stats": {
    "total_files_scanned": 4,
    "total_lines_of_code": 118,
    "languages": {
      "python": 1,
      "typescript": 1
    },
    "total_routes_detected": 8,
    "total_dependencies_detected": 7,
    "total_symbols_detected": 10
  },
  "ai_analysis": {
    "summary": "Full-Stack Client-Server Architecture (SPA + REST API) featuring FastAPI backend and TypeScript client.",
    "architecture_style": "Full-Stack Client-Server Architecture (SPA + REST API)",
    "tech_stack": ["Python", "Typescript", "Fastapi", "React"],
    "entrypoints": ["backend/app.py", "frontend/src/api.ts"],
    "data_flows": [
      {
        "flow_name": "Request to GET /api/items",
        "steps": [
          "1. Inbound request received at /api/items",
          "2. Routed to handler backend/app.py:list_items",
          "3. Executes business logic and serializes JSON response"
        ]
      }
    ],
    "suggested_diagram_nodes": [
      { "id": "node_client_ui", "label": "Frontend Client / UI", "type": "client", "group": "frontend" },
      { "id": "route_0", "label": "GET /api/items", "type": "api_route", "group": "backend" }
    ],
    "suggested_diagram_edges": [
      { "source": "node_client_ui", "target": "route_0", "label": "HTTP GET" }
    ]
  },
  "routes": [
    {
      "path": "/api/items",
      "method": "GET",
      "handler": "backend/app.py:list_items",
      "line_number": 43,
      "framework": "fastapi",
      "route_type": "server"
    }
  ],
  "dependencies": [
    {
      "name": "fastapi",
      "version": ">=0.115.0",
      "source_file": "backend/requirements.txt",
      "is_dev": false
    }
  ],
  "file_tree": {
    "name": "root",
    "type": "directory",
    "children": []
  }
}
```

---

## Running Verification Tests

To verify that the parser, analyzer, and API endpoints are working properly:

```bash
.\.venv\Scripts\python test_devlens.py
```
