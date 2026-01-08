"""DocumentKeywordモデル"""
from sqlalchemy import Column, BigInteger, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class DocumentKeyword(Base):
    """ドキュメント-キーワード中間テーブル"""
    __tablename__ = "document_keywords"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    document_id = Column(BigInteger, ForeignKey("documents.id"), nullable=False)
    keyword_id = Column(BigInteger, ForeignKey("keywords.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # ユニーク制約（同じ組み合わせの重複を防止）
    __table_args__ = (
        UniqueConstraint("document_id", "keyword_id", name="uk_document_keyword"),
    )

    # リレーションシップ
    document = relationship("Document", backref="document_keyword_relations")
    keyword = relationship("Keyword", backref="document_keyword_relations")

    def __repr__(self):
        return f"<DocumentKeyword(document_id={self.document_id}, keyword_id={self.keyword_id})>"

