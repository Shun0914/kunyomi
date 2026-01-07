from fastapi import FastAPI

app = FastAPI(
    title="くんよみ API",
    description="社内ナレッジ管理システムのAPI",
    version="0.1.0"
)


@app.get("/")
def read_root():
    """APIの稼働状況を確認するエンドポイント"""
    return {"message": "API is running", "status": "ok"}


@app.get("/health")
def health_check():
    """ヘルスチェック用エンドポイント"""
    return {"status": "healthy"}

