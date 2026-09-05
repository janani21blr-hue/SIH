from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine
from app.database import models
from app.routers import (
    health,
    entities,
    graph,
    relationships,
    investigations
)


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Criminal Network Analysis API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health.router)
app.include_router(entities.router)
app.include_router(graph.router)
app.include_router(relationships.router)
app.include_router(investigations.router)


@app.get("/")
def root():
    return {
        "message": "AI Criminal Network Analysis API is running"
    }