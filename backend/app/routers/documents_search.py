from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import List
from app.db import get_db
from app.models.document import Document
from app.models.keyword import Keyword
from app.schemas.document_list import DocumentResponse

router = APIRouter(prefix="/api/documents/search", tags=["documents"])

@router.get("", response_model=List[DocumentResponse])
def search_documents(
    q: str = Query(..., description="検索キーワード"),
    db: Session = Depends(get_db)
):
    """
    ドキュメント検索API
    - タイトルに対するLIKE検索
    - キーワード名に対するマッチング
    - スコアと更新日の降順でソート
    """
    # 1. クエリの作成（ジャンル、作成者、キーワードを結合）
    query = db.query(Document).options(
        joinedload(Document.genre),
        joinedload(Document.creator),
        joinedload(Document.keywords)
    ).join(Document.keywords, isouter=True) # キーワードがないドキュメントも取得できるよう外部結合

    # 2. 検索条件の設定 (タイトル または キーワード名 にヒット)
    search_filter = or_(
        Document.title.ilike(f"%{q}%"),
        Keyword.name == q,
        Keyword.normalized_name == q.lower() # 正規化名でのマッチング
    )
    
    # 3. フィルタ実行とソート
    # ソート順: 有益度スコア(降順) -> 更新日時(降順)
    documents = query.filter(search_filter)\
        .order_by(Document.helpfulness_score.desc(), Document.updated_at.desc())\
        .distinct()\
        .all()

    # 4. レスポンス形式への変換
    result = []
    for doc in documents:
        result.append({
            "id": doc.id,
            "title": doc.title,
            "content": doc.content,
            "genre_id": doc.genre_id,
            "genre_name": doc.genre.name if doc.genre else "未分類",
            "external_link": doc.external_link,
            "status": doc.status.lower() if isinstance(doc.status, str) else doc.status, # Enum(DocumentStatus)に合わせる
            "created_by": doc.created_by,
            "creator_name": doc.creator.name if doc.creator else "不明",
            "created_at": doc.created_at,
            "updated_by": doc.updated_by, 
            "updated_at": doc.updated_at,
            "helpful_count": doc.helpful_count,
            "view_count": doc.view_count,
            "helpfulness_score": doc.helpfulness_score, # スキーマのDecimalに合わせて自動変換
            "keywords": [{"id": kw.id, "name": kw.name} for kw in doc.keywords]
        })

    return result