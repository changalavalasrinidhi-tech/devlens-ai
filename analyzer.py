"""DevLens AI Architectural & Flow Analyzer.

Packages parsed repository metadata and integrates with Google Gemini API
(gemini-3.8-flash) to produce structured architectural insights, data flows,
and visualization graph nodes. Includes intelligent offline heuristic fallback.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional


class CodebaseAnalyzer:
    """Produces architectural summaries and flow visualizations from parsed repo data."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    def analyze(self, parse_result: Dict[str, Any]) -> Dict[str, Any]:
        """Runs AI analysis using Gemini API, or falls back to intelligent heuristic engine."""
        if self.api_key:
            try:
                ai_result = self._analyze_with_gemini(parse_result)
                if ai_result:
                    return ai_result
            except Exception as exc:
                # Log error and gracefully fall back to heuristics
                print(f"[DevLens Analyzer] Gemini API call failed ({exc}). Falling back to heuristic analysis.")

        return self._analyze_with_heuristics(parse_result)

    def _analyze_with_gemini(self, parse_result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Invokes Gemini 3.8 Flash via google-genai SDK."""
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)

        prompt = self._build_gemini_prompt(parse_result)

        system_instruction = (
            "You are DevLens AI, an expert system architect and code flow visualizer. "
            "Analyze the provided repository AST, routes, and dependency metadata. "
            "Respond ONLY with valid JSON matching the requested schema. "
            "Do not include markdown backticks or commentary outside JSON."
        )

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )

        if response and response.text:
            text = response.text.strip()
            # Clean markdown fences if any remain
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            data = json.loads(text.strip())
            data["analysis_source"] = "gemini-3.8-flash"
            return data

        return None

    def _build_gemini_prompt(self, parse_result: Dict[str, Any]) -> str:
        """Constructs a compact representation of the codebase metadata for the LLM."""
        stats = parse_result.get("summary_stats", {})
        routes = parse_result.get("routes", [])[:40]  # Limit to top 40 for context size
        dependencies = parse_result.get("dependencies", [])[:50]
        files = parse_result.get("files", [])

        # Extract file signatures (path + top classes/functions)
        file_signatures = []
        for f in files[:50]:
            symbols_summary = [s.get("name") for s in f.get("symbols", [])[:10]]
            file_signatures.append(
                {
                    "path": f.get("relative_path"),
                    "language": f.get("language"),
                    "symbols": symbols_summary,
                }
            )

        payload = {
            "root_name": parse_result.get("root_name", "repository"),
            "stats": stats,
            "key_files": file_signatures,
            "detected_routes": [
                {
                    "path": r.get("path"),
                    "method": r.get("method"),
                    "framework": r.get("framework"),
                    "handler": r.get("handler"),
                    "type": r.get("route_type"),
                }
                for r in routes
            ],
            "dependencies": [d.get("name") for d in dependencies],
        }

        return f"""
Analyze the following parsed codebase metadata:
{json.dumps(payload, indent=2)}

Generate a comprehensive JSON response with the following exact keys:
{{
  "summary": "Executive summary of the repository purpose and architecture",
  "architecture_style": "e.g. Modular REST API, Fullstack SPA + Microservice, Event-Driven, CLI",
  "tech_stack": ["List", "of", "technologies", "frameworks", "tools"],
  "entrypoints": ["file1", "file2"],
  "data_flows": [
    {{
      "flow_name": "Description of flow",
      "steps": ["Step 1: Frontend trigger", "Step 2: API route", "Step 3: Business logic/DB"]
    }}
  ],
  "suggested_diagram_nodes": [
    {{
      "id": "unique_node_id",
      "label": "Node display label",
      "type": "client | api_route | service | database | utility",
      "group": "frontend | backend | shared"
    }}
  ],
  "suggested_diagram_edges": [
    {{
      "source": "source_node_id",
      "target": "target_node_id",
      "label": "HTTP GET / calls / uses"
    }}
  ],
  "potential_risks_or_recommendations": ["Recommendation 1", "Recommendation 2"]
}}
"""

    def _analyze_with_heuristics(self, parse_result: Dict[str, Any]) -> Dict[str, Any]:
        """Provides instant, intelligent fallback architectural insights without requiring external API keys."""
        stats = parse_result.get("summary_stats", {})
        routes = parse_result.get("routes", [])
        dependencies = parse_result.get("dependencies", [])
        files = parse_result.get("files", [])
        languages = stats.get("languages", {})

        dep_names = {d.get("name", "").lower() for d in dependencies}

        # Detect tech stack
        tech_stack = list(languages.keys())
        if any("fastapi" in d for d in dep_names):
            tech_stack.append("FastAPI")
        if any("flask" in d for d in dep_names):
            tech_stack.append("Flask")
        if any("react" in d for d in dep_names):
            tech_stack.append("React")
        if any("express" in d for d in dep_names):
            tech_stack.append("Express.js")
        if any("pydantic" in d for d in dep_names):
            tech_stack.append("Pydantic")

        # Determine architecture style
        has_server_routes = any(r.get("route_type") == "server" for r in routes)
        has_client_routes = any(r.get("route_type") == "client" for r in routes)

        if has_server_routes and has_client_routes:
            arch_style = "Full-Stack Client-Server Architecture (SPA + REST API)"
        elif has_server_routes:
            arch_style = "RESTful Backend Microservice"
        elif has_client_routes:
            arch_style = "Frontend Client / Web Application"
        else:
            arch_style = "Modular Library or CLI Utility"

        # Detect entrypoints
        entrypoints = []
        for f in files:
            path = f.get("relative_path", "").lower()
            if any(path.endswith(e) for e in ["main.py", "app.py", "index.ts", "index.js", "server.js", "main.ts"]):
                entrypoints.append(f.get("relative_path"))

        if not entrypoints and files:
            entrypoints.append(files[0].get("relative_path"))

        # Build visual diagram nodes & edges
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        # Client Node (if client calls exist)
        if has_client_routes:
            nodes.append(
                {
                    "id": "node_client_ui",
                    "label": "Frontend Client / UI",
                    "type": "client",
                    "group": "frontend",
                }
            )

        # Route and Handler Nodes
        for idx, route in enumerate(routes[:15]):  # limit to top 15 for clean diagram
            route_id = f"route_{idx}"
            label = f"{route.get('method')} {route.get('path')}"
            is_client = route.get("route_type") == "client"

            nodes.append(
                {
                    "id": route_id,
                    "label": label,
                    "type": "api_route" if not is_client else "client_call",
                    "group": "backend" if not is_client else "frontend",
                }
            )

            if is_client and has_client_routes:
                edges.append(
                    {
                        "source": "node_client_ui",
                        "target": route_id,
                        "label": "Triggers",
                    }
                )
            elif not is_client and has_client_routes:
                # Connect client to corresponding backend routes if path matches or generic connection
                edges.append(
                    {
                        "source": "node_client_ui",
                        "target": route_id,
                        "label": f"HTTP {route.get('method')}",
                    }
                )

        # Service / Module nodes
        for f in files[:8]:
            path = f.get("relative_path")
            symbols = f.get("symbols", [])
            classes = [s.get("name") for s in symbols if s.get("kind") == "class"]
            if classes:
                module_id = f"mod_{path.replace('/', '_').replace('.', '_')}"
                nodes.append(
                    {
                        "id": module_id,
                        "label": f"{classes[0]} ({path})",
                        "type": "service",
                        "group": "backend",
                    }
                )

        # Data Flows
        data_flows = []
        if routes:
            for r in routes[:5]:
                data_flows.append(
                    {
                        "flow_name": f"Request to {r.get('method')} {r.get('path')}",
                        "steps": [
                            f"1. Inbound request received at {r.get('path')}",
                            f"2. Routed to handler {r.get('handler')}",
                            "3. Executes business logic and serializes JSON response",
                        ],
                    }
                )
        else:
            data_flows.append(
                {
                    "flow_name": "Standard Code Execution Flow",
                    "steps": [
                        f"1. Main entrypoint ({entrypoints[0] if entrypoints else 'module'})",
                        "2. Initializes components and dependencies",
                        "3. Executes core routines",
                    ],
                }
            )

        return {
            "summary": (
                f"DevLens identified a {arch_style} containing {stats.get('total_files_scanned', 0)} "
                f"scanned source files across {len(languages)} languages ({', '.join(languages.keys())}). "
                f"Found {len(routes)} API endpoints/calls and {len(dependencies)} external package dependencies."
            ),
            "architecture_style": arch_style,
            "tech_stack": [t.capitalize() for t in tech_stack],
            "entrypoints": entrypoints,
            "data_flows": data_flows,
            "suggested_diagram_nodes": nodes,
            "suggested_diagram_edges": edges,
            "potential_risks_or_recommendations": [
                "Ensure API route parameters are strictly validated using schemas (e.g., Pydantic or Zod).",
                "Verify CORS policies if frontend and backend run on different domains/ports.",
                "Review dependency versions for any potential security vulnerabilities.",
            ],
            "analysis_source": "heuristic_engine",
        }
