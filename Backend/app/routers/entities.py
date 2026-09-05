from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import EntityModel
from app.schemas.entity import Entity
from app.services.entity_service import (
    get_all_entities,
    get_entity_by_id
)

router = APIRouter(
    prefix="/entities",
    tags=["Entities"]
)


@router.get("", response_model=list[Entity])
def read_entities(
    db: Session = Depends(get_db)
):
    return get_all_entities(db)


@router.get("/{entity_id}", response_model=Entity)
def read_entity(
    entity_id: str,
    db: Session = Depends(get_db)
):
    entity = get_entity_by_id(db, entity_id)

    if entity is None:
        raise HTTPException(
            status_code=404,
            detail="Entity not found"
        )

    return entity


@router.post("", response_model=Entity)
def create_entity(
    entity: Entity,
    db: Session = Depends(get_db)
):
    db_entity = EntityModel(
        entity_id=entity.entity_id,
        entity_type=entity.entity_type,
        canonical_name=entity.canonical_name,
        aliases=entity.aliases,
        attributes=entity.attributes,
        confidence=entity.confidence
    )

    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)

    return db_entity