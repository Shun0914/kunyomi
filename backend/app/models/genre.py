"""Genreモデル"""
from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base


class Genre(Base):
    """ジャンル階層マスター"""
    __tablename__ = "genres"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(BigInteger, ForeignKey("genres.id"), nullable=True)
    level = Column(Integer, nullable=False)  # 階層レベル（1-5）
    path = Column(String(255), nullable=False)  # パス（例: "1/5/23"）
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # リレーションシップ
    parent = relationship("Genre", remote_side=[id], backref="children")

    def __repr__(self):
        return f"<Genre(id={self.id}, name='{self.name}', level={self.level}, path='{self.path}')>"

