from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import RelationshipModel
from app.schemas.relationship import Relationship

router = APIRouter(
    prefix="/relationships",
    tags=["Relationships"]
)


@router.post("", response_model=Relationship)
def create_relationship(
    relationship: Relationship,
    db: Session = Depends(get_db)
):
    db_relationship = RelationshipModel(
        source=relationship.source,
        target=relationship.target,
        relationship=relationship.relationship,
        confidence=relationship.confidence,
        evidence=relationship.evidence
    )

    db.add(db_relationship)
    db.commit()
    db.refresh(db_relationship)

    return db_relationship