from sqlalchemy.orm import Session

from app.database.models import InvestigationModel


def get_all_investigations(db: Session):
    return db.query(InvestigationModel).all()


def get_investigation_by_id(
    db: Session,
    investigation_id: str
):
    return (
        db.query(InvestigationModel)
        .filter(
            InvestigationModel.investigation_id == investigation_id
        )
        .first()
    )