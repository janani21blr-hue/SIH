from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import InvestigationModel
from app.schemas.investigation import Investigation
from app.services.investigation_service import (
    get_all_investigations,
    get_investigation_by_id
)


router = APIRouter(
    prefix="/investigations",
    tags=["Investigations"]
)


@router.get("", response_model=list[Investigation])
def read_investigations(
    db: Session = Depends(get_db)
):
    return get_all_investigations(db)


@router.get("/{investigation_id}", response_model=Investigation)
def read_investigation(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    investigation = get_investigation_by_id(
        db,
        investigation_id
    )

    if investigation is None:
        raise HTTPException(
            status_code=404,
            detail="Investigation not found"
        )

    return investigation


@router.post("", response_model=Investigation)
def create_investigation(
    investigation: Investigation,
    db: Session = Depends(get_db)
):
    existing_investigation = get_investigation_by_id(
        db,
        investigation.investigation_id
    )

    if existing_investigation is not None:
        raise HTTPException(
            status_code=400,
            detail="Investigation already exists"
        )

    db_investigation = InvestigationModel(
        investigation_id=investigation.investigation_id,
        title=investigation.title,
        description=investigation.description,
        status=investigation.status,
        risk_score=investigation.risk_score
    )

    db.add(db_investigation)
    db.commit()
    db.refresh(db_investigation)

    return db_investigation