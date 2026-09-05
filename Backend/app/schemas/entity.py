from typing import Any

from pydantic import BaseModel, Field


class Entity(BaseModel):
    entity_id: str
    entity_type: str
    canonical_name: str
    aliases: list[str] = Field(default_factory=list)
    attributes: dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0)