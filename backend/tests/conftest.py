"""
Pytest設定とフィクスチャ

単体テスト実行前に以下を実行してください：
  python scripts/init_genres.py
  python scripts/init_users.py

DATABASE_URL が .env に設定されている必要があります。
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db import get_db
from app.db import Base

# 環境変数でMySQLが使える場合は本番DB、そうでなければSQLite（異常系のみ動作）
import os
from dotenv import load_dotenv
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL and "mysql" in DATABASE_URL.lower():
    # 本番MySQL使用（トランザクションロールバックでクリーンアップ）
    connect_args = {}
    if "azure" in DATABASE_URL.lower():
        connect_args = {"ssl": {"ca": None}}

    test_engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args=connect_args,
    )
else:
    # SQLite（異常系テストのみ。正常系はMySQL環境で実行）
    test_engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """テスト用DBセッション（トランザクションロールバックでクリーンアップ）"""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="module")
def setup_test_db():
    """テスト用テーブル作成とマスタデータ投入"""
    # SQLiteの場合はテーブル作成、MySQLの場合は既存テーブルを使用
    if "sqlite" in str(test_engine.url):
        Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    try:
        from app.models.genre import Genre
        from app.models.user import User
        from datetime import datetime

        # SQLiteの場合のみマスタデータ投入（MySQLはinit_genres/init_users済み想定）
        if "sqlite" in str(test_engine.url):
            user = User(
                id=1,
                name="テストユーザー",
                email="test-pytest@example.com",
                department="テスト",
                created_at=datetime.now(),
            )
            db.add(user)
            genres_data = [
                {"id": 1, "name": "申請系", "parent_id": None, "level": 1, "path": "1", "display_order": 1},
                {"id": 2, "name": "経費申請", "parent_id": 1, "level": 2, "path": "1/2", "display_order": 1},
                {"id": 3, "name": "交通費", "parent_id": 2, "level": 3, "path": "1/2/3", "display_order": 1},
            ]
            for g in genres_data:
                genre = Genre(
                    id=g["id"],
                    name=g["name"],
                    parent_id=g["parent_id"],
                    level=g["level"],
                    path=g["path"],
                    display_order=g["display_order"],
                    is_active=True,
                    created_at=datetime.now(),
                )
                db.add(genre)
        db.commit()
        yield
    finally:
        db.close()


@pytest.fixture
def client(setup_test_db):
    """FastAPI TestClient（get_dbをオーバーライド）"""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
