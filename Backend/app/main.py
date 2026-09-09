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

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Criminal Network Analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(health.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(relationships.router, prefix="/api")
app.include_router(investigations.router, prefix="/api")


# React production build
BASE_DIR = Path(__file__).resolve().parents[2]
DIST_DIR = BASE_DIR / "dist"


# Serve React assets
if (DIST_DIR / "assets").exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(DIST_DIR / "assets")),
        name="assets",
    )


# Serve React homepage
@app.get("/")
def serve_frontend():
    index_file = DIST_DIR / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": "Frontend build not found"
    }


# React Router fallback
@app.get("/{full_path:path}")
def serve_react_routes(full_path: str):

    # Don't intercept API requests
    if full_path.startswith("api/"):
        return {"detail": "API endpoint not found"}

    requested_file = DIST_DIR / full_path

    if requested_file.is_file():
        return FileResponse(requested_file)

    # React Router fallback
    index_file = DIST_DIR / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "message": "Frontend build not found"
    }