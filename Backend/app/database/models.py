from sqlalchemy import Column, Integer, String, Float, JSON

from app.database.connection import Base


class EntityModel(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, unique=True, index=True, nullable=False)
    entity_type = Column(String, nullable=False)
    canonical_name = Column(String, nullable=False)
    aliases = Column(JSON, default=list)
    attributes = Column(JSON, default=dict)
    confidence = Column(Float, nullable=False)


class RelationshipModel(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, nullable=False)
    target = Column(String, nullable=False)
    relationship = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    evidence = Column(String, nullable=False)


class InvestigationModel(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)