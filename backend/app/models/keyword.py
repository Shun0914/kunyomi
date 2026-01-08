"""Keywordモデル"""
from sqlalchemy import Column, BigInteger, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Keyword(Base):
    """キーワードマスター（動的生成）"""
    __tablename__ = "keywords"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)  # キーワード名（表示用）
    normalized_name = Column(String(100), nullable=False, unique=True)  # 正規化名（検索用）
    usage_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # リレーションシップ
    documents = relationship("Document", secondary="document_keywords", back_populates="keywords")

    def __repr__(self):
        return f"<Keyword(id={self.id}, name='{self.name}', normalized_name='{self.normalized_name}')>"

