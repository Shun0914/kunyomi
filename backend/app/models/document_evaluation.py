"""DocumentEvaluationモデル"""
from sqlalchemy import Column, BigInteger, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class DocumentEvaluation(Base):
    """評価（役立ち度）"""
    __tablename__ = "document_evaluations"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    document_id = Column(BigInteger, ForeignKey("documents.id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    is_helpful = Column(Boolean, nullable=False)  # 役立った=TRUE, そうでもない=FALSE
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # ユニーク制約（1ユーザーにつき1ドキュメントに1回のみ評価可能）
    __table_args__ = (
        UniqueConstraint("document_id", "user_id", name="uk_document_user"),
    )

    # リレーションシップ
    document = relationship("Document", backref="document_evaluation_relations")
    user = relationship("User", backref="document_evaluation_relations")

    def __repr__(self):
        return f"<DocumentEvaluation(document_id={self.document_id}, user_id={self.user_id}, is_helpful={self.is_helpful})>"

