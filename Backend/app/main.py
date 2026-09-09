from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database.connection import Base, engine
from app.database import models

from app.routers import (
    health,
    entities,
    graph,
    relationships,
    investigations,
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="AI Criminal Network Analysis API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTES
# ============================================================

app.include_router(
    health.router,
    prefix="/api",
)

app.include_router(
    entities.router,
    prefix="/api",
)

app.include_router(
    graph.router,
    prefix="/api",
)

app.include_router(
    relationships.router,
    prefix="/api",
)

app.include_router(
    investigations.router,
    prefix="/api",
)


# ============================================================
# REACT FRONTEND
# ============================================================

# Project structure:
#
# SIH/
# ├── dist/
# │   ├── index.html
# │   └── assets/
# │
# └── Backend/
#     └── app/
#         └── main.py
#
# parents[0] = app/
# parents[1] = Backend/
# parents[2] = SIH/
#
# Therefore this points to the project root.

BASE_DIR = Path(__file__).resolve().parents[2]

DIST_DIR = BASE_DIR / "dist"


# ============================================================
# STATIC FRONTEND ASSETS
# ============================================================

if (DIST_DIR / "assets").exists():

    app.mount(
        "/assets",
        StaticFiles(
            directory=str(DIST_DIR / "assets")
        ),
        name="assets",
    )


# ============================================================
# ROOT → REACT APPLICATION
# ============================================================

@app.get("/")
def serve_frontend():

    index_file = DIST_DIR / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": "Frontend build not found"
    }


# ============================================================
# REACT ROUTER FALLBACK
# ============================================================
#
# This allows routes such as:
#
# /entities
# /investigations
# /reports
#
# to work when directly opened/refreshed.
#
# ============================================================

@app.get("/{full_path:path}")
def serve_react_routes(full_path: str):

    # Do not interfere with API requests.
    if full_path.startswith("api/"):
        return {
            "detail": "API endpoint not found"
        }

    requested_file = DIST_DIR / full_path

    # If the requested path is an actual file,
    # serve that file.
    if requested_file.is_file():
        return FileResponse(requested_file)

    # Otherwise return React's index.html.
    # React Router will decide which page to display.
    index_file = DIST_DIR / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": "Frontend build not found"
    }