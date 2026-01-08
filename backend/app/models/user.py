"""Userモデル"""
from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.sql import func
from app.db import Base


class User(Base):
    """ユーザー情報"""
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    department = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)  # リリース2以降で使用
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"

