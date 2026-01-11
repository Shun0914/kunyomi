from fastapi import FastAPI
from sqlalchemy import text
from app.db import engine
from app.routers import keywords, documents, genre

app = FastAPI(
    title="くんよみ API",
    description="社内ナレッジ管理システムのAPI",
    version="0.1.0"
)

# ルーターの登録
app.include_router(genre.router)
app.include_router(keywords.router)
app.include_router(documents.router)


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

