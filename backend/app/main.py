import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from dotenv import load_dotenv
from app.db import engine
from app.routers import keywords, documents, genre, documents_list, documents_search, network

# 環境変数を読み込む
load_dotenv()

app = FastAPI(
    title="くんよみ API",
    description="社内ナレッジ管理システムのAPI",
    version="0.1.0"
)

# CORS設定: 環境変数から許可するオリジンを取得
# 開発環境: localhost:3000, 127.0.0.1:3000（デフォルト）
# 本番環境: フロントエンドApp ServiceのURL（環境変数から取得）
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"  # デフォルト値（開発環境用）
)

# カンマ区切りで分割してリストに変換
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

# CORSミドルウェアを追加（ルーター登録の前に配置）
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],              # すべてのHTTPメソッドを許可
    allow_headers=["*"],              # すべてのヘッダーを許可
)

# ルーターの登録
app.include_router(genre.router)
app.include_router(keywords.router)
app.include_router(documents_search.router)
app.include_router(documents.router)
app.include_router(documents_list.router)
app.include_router(network.router)


@app.get("/")
def read_root():
    """APIの稼働状況を確認するエンドポイント"""
    return {"message": "API is running", "status": "ok"}


@app.get("/health")
def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "healthy"}


@app.get("/health/db")
def health_check_db():
    """データベース接続確認用エンドポイント"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

