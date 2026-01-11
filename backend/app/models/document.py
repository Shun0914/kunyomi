"""Documentモデル"""
from sqlalchemy import Column, BigInteger, String, Text, Integer, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db import Base


class DocumentStatus(enum.Enum):
    """ドキュメントステータス"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Document(Base):
    """ナレッジ/ドキュメント本体"""
    __tablename__ = "documents"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)  # 本文（Markdown対応想定）
    genre_id = Column(BigInteger, ForeignKey("genres.id"), nullable=False)
    external_link = Column(String(500), nullable=True)
    status = Column(Enum(DocumentStatus), nullable=False, default=DocumentStatus.DRAFT)
    created_by = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)  # 初回作成時はNULL
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    helpful_count = Column(Integer, nullable=False, default=0)
    view_count = Column(Integer, nullable=False, default=0)
    helpfulness_score = Column(Numeric(5, 2), nullable=False, default=0.00)

    # リレーションシップ
    genre = relationship("Genre", backref="documents")
    creator = relationship("User", foreign_keys=[created_by], backref="created_documents")
    updater = relationship("User", foreign_keys=[updated_by], backref="updated_documents")
    keywords = relationship("Keyword", secondary="document_keywords", back_populates="documents", overlaps="document_keyword_relations")

    def __repr__(self):
        return f"<Document(id={self.id}, title='{self.title}', status='{self.status.value}')>"

