from sqlalchemy.orm import Session

from app.database.models import EntityModel, RelationshipModel


def get_graph(db: Session):
    entities = db.query(EntityModel).all()
    relationships = db.query(RelationshipModel).all()

    return {
        "nodes": entities,
        "edges": relationships
    }