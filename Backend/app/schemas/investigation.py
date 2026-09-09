from pydantic import BaseModel, Field


class Investigation(BaseModel):
    investigation_id: str
    title: str
    description: str
    status: str
    risk_score: float = Field(ge=0.0, le=1.0)