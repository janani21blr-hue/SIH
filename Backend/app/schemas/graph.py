from pydantic import BaseModel

from app.schemas.entity import Entity
from app.schemas.relationship import Relationship


class GraphResponse(BaseModel):
    nodes: list[Entity]
    edges: list[Relationship]