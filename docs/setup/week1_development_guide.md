# Week 1 開発ガイド

このドキュメントでは、Week 1で実装するバックエンドAPIの開発手順を説明します。

## 目次

1. [開発環境の準備](#開発環境の準備)
2. [API実装の基本構造](#api実装の基本構造)
3. [実装手順（例：ジャンル一覧取得API）](#実装手順例ジャンル一覧取得api)
4. [テスト方法](#テスト方法)
5. [よくある質問](#よくある質問)

---

## 開発環境の準備

### 1. 最新のコードを取得

```bash
git checkout main
git pull origin main
```

### 2. バックエンドの依存関係を確認

```bash
cd backend
source venv/bin/activate  # 仮想環境をアクティベート
pip install -r requirements.txt
```

### 3. データベースの確認

```bash
# MySQLに接続して確認
mysql -u root -p
```

```sql
USE kunyomi_db;
SHOW TABLES;  -- テーブルが作成されているか確認
SELECT COUNT(*) FROM genres;  -- ジャンルデータが投入されているか確認
```

---

## API実装の基本構造

### ディレクトリ構造

```
backend/
├── app/
│   ├── main.py          # FastAPIアプリのエントリーポイント
│   ├── db.py            # データベース接続設定
│   ├── models/          # SQLAlchemyモデル（既に定義済み）
│   │   ├── genre.py
│   │   ├── document.py
│   │   └── ...
│   ├── routers/         # APIエンドポイント（ここに実装）
│   │   ├── genres.py    # ジャンル関連API
│   │   ├── documents.py # ドキュメント関連API
│   │   └── keywords.py  # キーワード関連API
│   └── schemas/         # Pydanticスキーマ（リクエスト/レスポンス）
│       ├── genre.py
│       ├── document.py
│       └── ...
```

### 実装の流れ

1. **スキーマ定義** (`app/schemas/`) - リクエスト/レスポンスの型を定義
2. **ルーター実装** (`app/routers/`) - エンドポイントを実装
3. **main.pyに登録** - ルーターをアプリに登録
4. **テスト** - Swagger UIやPostmanで動作確認

---

## 実装手順（例：ジャンル一覧取得API）

### ステップ1: スキーマ定義を作成

`backend/app/schemas/genre.py`を作成：

```python
from pydantic import BaseModel
from datetime import datetime

class GenreResponse(BaseModel):
    """ジャンルレスポンススキーマ"""
    id: int
    name: str
    parent_id: int | None
    level: int
    path: str
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemyモデルから自動変換
```

### ステップ2: ルーターを作成

`backend/app/routers/genres.py`を作成：

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.genre import Genre
from app.schemas.genre import GenreResponse

router = APIRouter(prefix="/api/genres", tags=["genres"])

@router.get("", response_model=List[GenreResponse])
def get_genres(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    ジャンル一覧を取得
    
    - **include_inactive**: 非アクティブなジャンルも含めるか（デフォルト: False）
    """
    query = db.query(Genre)
    
    if not include_inactive:
        query = query.filter(Genre.is_active == True)
    
    genres = query.order_by(Genre.display_order).all()
    
    return genres
```

### ステップ3: main.pyにルーターを登録

`backend/app/main.py`を修正：

```python
from fastapi import FastAPI
from sqlalchemy import text
from app.db import engine
from app.routers import genres  # 追加

app = FastAPI(
    title="くんよみ API",
    description="社内ナレッジ管理システムのAPI",
    version="0.1.0"
)

# ルーターを登録
app.include_router(genres.router)  # 追加

# 既存のエンドポイント...
@app.get("/")
def read_root():
    """APIの稼働状況を確認するエンドポイント"""
    return {"message": "API is running", "status": "ok"}

# ... 以下既存のコード
```

### ステップ4: 動作確認

```bash
# サーバーを起動
cd backend
uvicorn app.main:app --reload
```

ブラウザで以下にアクセス：
- Swagger UI: http://localhost:8000/docs
- 直接アクセス: http://localhost:8000/api/genres

---

## 実装のポイント

### 1. エラーハンドリング

```python
@router.get("/{genre_id}", response_model=GenreResponse)
def get_genre(genre_id: int, db: Session = Depends(get_db)):
    """ジャンル詳細を取得"""
    genre = db.query(Genre).filter(Genre.id == genre_id).first()
    
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    
    return genre
```

### 2. クエリパラメータ

```python
@router.get("", response_model=List[GenreResponse])
def get_genres(
    include_inactive: bool = False,  # クエリパラメータ
    db: Session = Depends(get_db)
):
    # 実装...
```

### 3. リレーションシップの読み込み

```python
from sqlalchemy.orm import joinedload

# ジャンルと一緒にドキュメントも取得する場合
genres = db.query(Genre).options(
    joinedload(Genre.documents)
).all()
```

### 4. トランザクション処理

```python
from sqlalchemy.exc import IntegrityError

try:
    # データベース操作
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
except IntegrityError:
    db.rollback()
    raise HTTPException(status_code=400, detail="Integrity error")
```

---

## テスト方法

### 1. Swagger UIでテスト

1. サーバーを起動: `uvicorn app.main:app --reload`
2. ブラウザで http://localhost:8000/docs にアクセス
3. エンドポイントをクリックして「Try it out」→「Execute」

### 2. curlでテスト

```bash
# ジャンル一覧取得
curl http://localhost:8000/api/genres

# クエリパラメータ付き
curl "http://localhost:8000/api/genres?include_inactive=true"
```

### 3. Postmanでテスト

1. Postmanを起動
2. 新しいリクエストを作成
3. GETメソッドで `http://localhost:8000/api/genres` にリクエスト
4. レスポンスを確認

---

## よくある質問

### Q: エラー「ModuleNotFoundError: No module named 'app'」が出る

**A**: 仮想環境がアクティベートされているか確認してください。

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Q: データベース接続エラーが出る

**A**: `.env`ファイルの設定を確認してください。

```bash
# backend/.env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/kunyomi_db
```

### Q: レスポンスにリレーションシップのデータが含まれない

**A**: `joinedload`や`selectinload`を使用してリレーションシップを読み込みます。

```python
from sqlalchemy.orm import joinedload

genres = db.query(Genre).options(
    joinedload(Genre.documents)
).all()
```

### Q: フロントエンドからAPIを呼び出すとCORSエラーが出る

**A**: FastAPIにCORSミドルウェアを追加します。

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.jsのデフォルトポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Q: バリデーションエラーが出る

**A**: Pydanticスキーマの定義を確認してください。リクエストボディの型がスキーマと一致しているか確認します。

---

## 実装チェックリスト

APIを実装したら、以下を確認してください：

- [ ] エンドポイントがSwagger UIに表示される
- [ ] 正常系のレスポンスが返る
- [ ] エラーハンドリングが実装されている（404、400等）
- [ ] クエリパラメータが正しく動作する
- [ ] データベースから正しいデータが取得できる
- [ ] フロントエンドのAPIクライアント関数から呼び出せる（Phase 2以降）

---

## 次のステップ

API実装が完了したら：

1. **PRを作成** - [GitHubワークフロー](./github_workflow.md)を参照
2. **コードレビュー** - チームメンバーにレビューを依頼
3. **マージ** - レビュー承認後にマージ
4. **次のAPI実装** - 他のエンドポイントに着手

---

## 参考資料

- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [SQLAlchemy公式ドキュメント](https://www.sqlalchemy.org/)
- [Pydantic公式ドキュメント](https://docs.pydantic.dev/)
- [タスク分割案](../tasks/task_breakdown_week1.md)
- [データ定義](../design/data_definition.md)

