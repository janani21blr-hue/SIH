from sqlalchemy.orm import Session

from app.database.models import EntityModel


def get_all_entities(db: Session):
    return db.query(EntityModel).all()


def get_entity_by_id(db: Session, entity_id: str):
    return (
        db.query(EntityModel)
        .filter(EntityModel.entity_id == entity_id)
        .first()
    )