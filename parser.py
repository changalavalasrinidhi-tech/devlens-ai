"""DevLens Static Code Parser.

Performs recursive directory traversal and static analysis for Python, JavaScript,
TypeScript, and dependency manifests.
"""

from __future__ import annotations

import ast
import json
import os
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

# Ignored directory names during recursive traversal
IGNORED_DIRS: Set[str] = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "env",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".cache",
    ".pytest_cache",
    ".idea",
    ".vscode",
    ".mypy_cache",
    ".system_generated",
    "coverage",
    ".coverage",
}

# Supported file extensions
SUPPORTED_EXTENSIONS = {
    ".py": "python",
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".txt": "text",
}


@dataclass
class CodeSymbol:
    name: str
    kind: str  # "function", "async_function", "class", "method"
    line_number: int
    parent: Optional[str] = None
    docstring: Optional[str] = None
    params: List[str] = field(default_factory=list)


@dataclass
class ApiRoute:
    path: str
    method: str
    handler: str
    line_number: int
    framework: str  # "fastapi", "flask", "express", "client_fetch", "client_axios"
    route_type: str = "server"  # "server" or "client"


@dataclass
class DependencyInfo:
    name: str
    version: Optional[str] = None
    source_file: str = ""
    is_dev: bool = False


@dataclass
class ParsedFile:
    relative_path: str
    language: str
    size_bytes: int
    lines_of_code: int
    symbols: List[CodeSymbol] = field(default_factory=list)
    routes: List[ApiRoute] = field(default_factory=list)
    imports: List[str] = field(default_factory=list)


@dataclass
class RepoParseResult:
    root_name: str
    file_tree: Dict[str, Any]
    files: List[ParsedFile]
    routes: List[ApiRoute]
    dependencies: List[DependencyInfo]
    summary_stats: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "root_name": self.root_name,
            "file_tree": self.file_tree,
            "files": [asdict(f) for f in self.files],
            "routes": [asdict(r) for r in self.routes],
            "dependencies": [asdict(d) for d in self.dependencies],
            "summary_stats": self.summary_stats,
        }


class PythonAstVisitor(ast.NodeVisitor):
    """Extracts functions, classes, and API routes from Python AST."""

    def __init__(self) -> None:
        self.symbols: List[CodeSymbol] = []
        self.routes: List[ApiRoute] = []
        self.imports: List[str] = []
        self._current_class: Optional[str] = None

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        if node.module:
            self.imports.append(node.module)
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        doc = ast.get_docstring(node)
        self.symbols.append(
            CodeSymbol(
                name=node.name,
                kind="class",
                line_number=node.lineno,
                parent=self._current_class,
                docstring=doc,
            )
        )
        prev_class = self._current_class
        self._current_class = node.name
        self.generic_visit(node)
        self._current_class = prev_class

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._handle_function(node, is_async=False)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._handle_function(node, is_async=True)

    def _handle_function(
        self,
        node: ast.FunctionDef | ast.AsyncFunctionDef,
        is_async: bool,
    ) -> None:
        doc = ast.get_docstring(node)
        kind = "method" if self._current_class else ("async_function" if is_async else "function")
        params = [arg.arg for arg in node.args.args]

        self.symbols.append(
            CodeSymbol(
                name=node.name,
                kind=kind,
                line_number=node.lineno,
                parent=self._current_class,
                docstring=doc,
                params=params,
            )
        )

        # Inspect decorators for FastAPI/Flask routes
        for decorator in node.decorator_list:
            route_info = self._parse_route_decorator(decorator, node.name, node.lineno)
            if route_info:
                self.routes.append(route_info)

        self.generic_visit(node)

    def _parse_route_decorator(
        self,
        decorator: ast.expr,
        handler_name: str,
        line_no: int,
    ) -> Optional[ApiRoute]:
        """Detects decorators like @app.get('/path'), @router.post('/path'), @app.route('/path')."""
        if not isinstance(decorator, ast.Call):
            return None

        # Check call attribute: e.g., app.get or router.post
        func = decorator.func
        if not isinstance(func, ast.Attribute):
            return None

        method_attr = func.attr.lower()
        http_methods = {"get", "post", "put", "delete", "patch", "options", "head"}

        # Extract path argument (usually first argument)
        path = "/"
        if decorator.args:
            first_arg = decorator.args[0]
            if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                path = first_arg.value

        if method_attr in http_methods:
            return ApiRoute(
                path=path,
                method=method_attr.upper(),
                handler=handler_name,
                line_number=line_no,
                framework="fastapi",
                route_type="server",
            )
        elif method_attr == "route":
            # Flask style @app.route("/path", methods=["GET", "POST"])
            methods = ["GET"]
            for keyword in decorator.keywords:
                if keyword.arg == "methods" and isinstance(keyword.value, (ast.List, ast.Tuple)):
                    methods = [
                        elt.value.upper()
                        for elt in keyword.value.elts
                        if isinstance(elt, ast.Constant) and isinstance(elt.value, str)
                    ]
            return ApiRoute(
                path=path,
                method=",".join(methods) if methods else "GET",
                handler=handler_name,
                line_number=line_no,
                framework="flask",
                route_type="server",
            )

        return None


def parse_python_file(content: str) -> tuple[List[CodeSymbol], List[ApiRoute], List[str]]:
    """Parse Python source code using AST, falling back to regex on syntax errors."""
    try:
        tree = ast.parse(content)
        visitor = PythonAstVisitor()
        visitor.visit(tree)
        return visitor.symbols, visitor.routes, visitor.imports
    except SyntaxError:
        # Fallback to regex-based extraction
        symbols: List[CodeSymbol] = []
        routes: List[ApiRoute] = []
        imports: List[str] = []

        lines = content.splitlines()
        for i, line in enumerate(lines, start=1):
            stripped = line.strip()

            # Functions & Classes
            func_match = re.match(r"^(?:async\s+)?def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)", stripped)
            if func_match:
                name = func_match.group(1)
                raw_params = [p.strip().split(":")[0] for p in func_match.group(2).split(",") if p.strip()]
                is_async = stripped.startswith("async")
                symbols.append(
                    CodeSymbol(
                        name=name,
                        kind="async_function" if is_async else "function",
                        line_number=i,
                        params=raw_params,
                    )
                )

            class_match = re.match(r"^class\s+([a-zA-Z_][a-zA-Z0-9_]*)", stripped)
            if class_match:
                symbols.append(
                    CodeSymbol(
                        name=class_match.group(1),
                        kind="class",
                        line_number=i,
                    )
                )

            # API routes via regex
            route_match = re.search(
                r"@(?:app|router|api_router)\.(get|post|put|delete|patch|route)\s*\(\s*['\"]([^'\"]+)['\"]",
                stripped,
                re.IGNORECASE,
            )
            if route_match:
                method = route_match.group(1).upper()
                path = route_match.group(2)
                routes.append(
                    ApiRoute(
                        path=path,
                        method="GET" if method == "ROUTE" else method,
                        handler="unknown",
                        line_number=i,
                        framework="fastapi/flask",
                        route_type="server",
                    )
                )

            # Imports
            if stripped.startswith("import ") or stripped.startswith("from "):
                parts = stripped.split()
                if len(parts) >= 2:
                    imports.append(parts[1])

        return symbols, routes, imports


def parse_js_ts_file(content: str) -> tuple[List[CodeSymbol], List[ApiRoute], List[str]]:
    """Parse JavaScript and TypeScript files using robust regular expressions."""
    symbols: List[CodeSymbol] = []
    routes: List[ApiRoute] = []
    imports: List[str] = []

    lines = content.splitlines()
    for i, line in enumerate(lines, start=1):
        stripped = line.strip()

        # Skip comment lines
        if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*"):
            continue

        # Classes
        class_match = re.search(r"\bclass\s+([a-zA-Z0-9_$]+)", stripped)
        if class_match:
            symbols.append(
                CodeSymbol(
                    name=class_match.group(1),
                    kind="class",
                    line_number=i,
                )
            )

        # Standard function: function foo(x, y)
        func_match = re.search(r"\bfunction\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)", stripped)
        if func_match:
            symbols.append(
                CodeSymbol(
                    name=func_match.group(1),
                    kind="function",
                    line_number=i,
                    params=[p.strip() for p in func_match.group(2).split(",") if p.strip()],
                )
            )

        # Arrow function or variable assigned function: const myFunc = (...) =>
        arrow_match = re.search(
            r"\b(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|[a-zA-Z0-9_$]+)\s*(?::\s*[^=]+)?\s*=>",
            stripped,
        )
        if arrow_match:
            symbols.append(
                CodeSymbol(
                    name=arrow_match.group(1),
                    kind="arrow_function",
                    line_number=i,
                    params=[p.strip() for p in (arrow_match.group(2) or "").split(",") if p.strip()],
                )
            )

        # Server-side route handlers (Express / Fastify / NestJS style):
        # app.get('/api/users', ...), router.post('/login', ...)
        server_route_match = re.search(
            r"\b(?:app|router|server)\.(get|post|put|delete|patch|options)\s*\(\s*['\"`]([^'\"`]+)['\"`]",
            stripped,
            re.IGNORECASE,
        )
        if server_route_match:
            routes.append(
                ApiRoute(
                    path=server_route_match.group(2),
                    method=server_route_match.group(1).upper(),
                    handler=f"line_{i}",
                    line_number=i,
                    framework="express",
                    route_type="server",
                )
            )

        # Client-side API fetch calls: fetch('/api/data') or axios.get('/api/data')
        fetch_match = re.search(r"\bfetch\s*\(\s*['\"`]([^'\"`]+)['\"`]", stripped)
        if fetch_match:
            routes.append(
                ApiRoute(
                    path=fetch_match.group(1),
                    method="GET/FETCH",
                    handler=f"fetch_call_line_{i}",
                    line_number=i,
                    framework="client_fetch",
                    route_type="client",
                )
            )

        axios_match = re.search(
            r"\baxios\.(get|post|put|delete|patch)\s*\(\s*['\"`]([^'\"`]+)['\"`]",
            stripped,
            re.IGNORECASE,
        )
        if axios_match:
            routes.append(
                ApiRoute(
                    path=axios_match.group(2),
                    method=axios_match.group(1).upper(),
                    handler=f"axios_call_line_{i}",
                    line_number=i,
                    framework="client_axios",
                    route_type="client",
                )
            )

        # Imports: import x from 'pkg' or require('pkg')
        import_match = re.search(r"""(?:import\s+.*?from\s+['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\))""", stripped)
        if import_match:
            pkg = import_match.group(1) or import_match.group(2)
            if pkg and not pkg.startswith("."):
                imports.append(pkg)

    return symbols, routes, imports


def parse_requirements_txt(content: str, filepath: str) -> List[DependencyInfo]:
    """Parse Python dependencies from requirements.txt."""
    dependencies: List[DependencyInfo] = []
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        # Match name and optional specifier: e.g. fastapi>=0.115.0 or flask==3.0.0
        match = re.match(r"^([a-zA-Z0-9_.-]+)(.*)", line)
        if match:
            name = match.group(1)
            version = match.group(2).strip() or None
            dependencies.append(
                DependencyInfo(
                    name=name,
                    version=version,
                    source_file=filepath,
                    is_dev=False,
                )
            )
    return dependencies


def parse_package_json(content: str, filepath: str) -> List[DependencyInfo]:
    """Parse JavaScript/TypeScript dependencies from package.json."""
    dependencies: List[DependencyInfo] = []
    try:
        data = json.loads(content)
        deps = data.get("dependencies", {})
        for name, version in deps.items():
            dependencies.append(
                DependencyInfo(
                    name=name,
                    version=str(version),
                    source_file=filepath,
                    is_dev=False,
                )
            )
        dev_deps = data.get("devDependencies", {})
        for name, version in dev_deps.items():
            dependencies.append(
                DependencyInfo(
                    name=name,
                    version=str(version),
                    source_file=filepath,
                    is_dev=True,
                )
            )
    except Exception:
        pass
    return dependencies


def build_directory_tree(root_path: Path, current_path: Path) -> Dict[str, Any]:
    """Recursively builds a tree dictionary representing the directory structure."""
    relative = current_path.relative_to(root_path).as_posix()
    tree_node: Dict[str, Any] = {
        "name": current_path.name if relative != "." else root_path.name,
        "path": relative if relative != "." else "",
        "type": "directory" if current_path.is_dir() else "file",
    }

    if current_path.is_dir():
        children: List[Dict[str, Any]] = []
        try:
            for item in sorted(current_path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
                if item.name in IGNORED_DIRS or item.name.startswith("."):
                    continue
                children.append(build_directory_tree(root_path, item))
        except PermissionError:
            pass
        tree_node["children"] = children
    else:
        tree_node["extension"] = current_path.suffix.lower()
        try:
            tree_node["size_bytes"] = current_path.stat().st_size
        except OSError:
            tree_node["size_bytes"] = 0

    return tree_node


class RepoParser:
    """Recursively traverses and parses a repository directory."""

    def __init__(self, root_dir: str | Path) -> None:
        self.root_path = Path(root_dir).resolve()
        if not self.root_path.exists():
            raise FileNotFoundError(f"Path does not exist: {self.root_path}")

    def parse(self) -> RepoParseResult:
        parsed_files: List[ParsedFile] = []
        all_routes: List[ApiRoute] = []
        all_dependencies: List[DependencyInfo] = []
        languages_count: Dict[str, int] = {}
        total_lines = 0

        # Traverse all files using os.walk with IGNORED_DIRS filter
        for dirpath, dirnames, filenames in os.walk(self.root_path):
            # Prune ignored directories in-place
            dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS and not d.startswith(".")]

            current_dir = Path(dirpath)
            for filename in filenames:
                file_path = current_dir / filename
                suffix = file_path.suffix.lower()

                rel_path = file_path.relative_to(self.root_path).as_posix()

                # Handle dependency manifests
                if filename == "requirements.txt":
                    try:
                        content = file_path.read_text(encoding="utf-8", errors="replace")
                        all_dependencies.extend(parse_requirements_txt(content, rel_path))
                    except Exception:
                        pass

                if filename == "package.json":
                    try:
                        content = file_path.read_text(encoding="utf-8", errors="replace")
                        all_dependencies.extend(parse_package_json(content, rel_path))
                    except Exception:
                        pass

                # Handle code files
                if suffix not in SUPPORTED_EXTENSIONS or suffix in {".json", ".txt"}:
                    continue

                lang = SUPPORTED_EXTENSIONS.get(suffix, "unknown")
                languages_count[lang] = languages_count.get(lang, 0) + 1

                try:
                    content = file_path.read_text(encoding="utf-8", errors="replace")
                    file_lines = len(content.splitlines())
                    total_lines += file_lines
                    size_bytes = file_path.stat().st_size

                    symbols: List[CodeSymbol] = []
                    routes: List[ApiRoute] = []
                    imports: List[str] = []

                    if lang == "python":
                        symbols, routes, imports = parse_python_file(content)
                    elif lang in {"javascript", "typescript"}:
                        symbols, routes, imports = parse_js_ts_file(content)

                    # Augment routes with file info
                    for r in routes:
                        r.handler = f"{rel_path}:{r.handler}"
                    all_routes.extend(routes)

                    parsed_files.append(
                        ParsedFile(
                            relative_path=rel_path,
                            language=lang,
                            size_bytes=size_bytes,
                            lines_of_code=file_lines,
                            symbols=symbols,
                            routes=routes,
                            imports=imports,
                        )
                    )
                except Exception as e:
                    # Log or skip unparseable files without crashing
                    parsed_files.append(
                        ParsedFile(
                            relative_path=rel_path,
                            language=lang,
                            size_bytes=0,
                            lines_of_code=0,
                        )
                    )

        # Build file tree
        file_tree = build_directory_tree(self.root_path, self.root_path)

        summary_stats = {
            "total_files_scanned": len(parsed_files),
            "total_lines_of_code": total_lines,
            "languages": languages_count,
            "total_routes_detected": len(all_routes),
            "total_dependencies_detected": len(all_dependencies),
            "total_symbols_detected": sum(len(f.symbols) for f in parsed_files),
        }

        return RepoParseResult(
            root_name=self.root_path.name,
            file_tree=file_tree,
            files=parsed_files,
            routes=all_routes,
            dependencies=all_dependencies,
            summary_stats=summary_stats,
        )
