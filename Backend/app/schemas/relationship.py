from pydantic import BaseModel, Field


class Relationship(BaseModel):
    source: str
    target: str
    relationship: str
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str
    