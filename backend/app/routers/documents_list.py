#ドキュメント一覧取得
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.db import get_db
from app.models.document import Document
from app.models.genre import Genre
from app.models.user import User
from app.schemas.document_list import DocumentResponse

router = APIRouter(prefix="/api/documents_list", tags=["documents_list"])

@router.get("", response_model=List[DocumentResponse])
def get_documents_list(
    genre_id: Optional[int] = Query(None, description="ジャンルIDでフィルタ"),
    status: Optional[str] = Query(None, description="ステータスでフィルタ（draft/published/archived）"),
    skip: int = Query(0, ge=0, description="スキップ件数（ページネーション用）"),
    limit: int = Query(10, ge=1, le=100, description="取得件数（ページネーション用）"),
    db: Session = Depends(get_db)
):
    """
    ドキュメント一覧取得API

    - ジャンルIDとステータスでフィルタ可能
    - ページネーション対応（skip, limit）
    - ジャンル名・作成者名を含む
    - 取得結果をビュー数の降順、作成日の降順でソート
    - 存在しないIDやステータスが指定された場合は 404
    """
    query = db.query(Document).options(
        joinedload(Document.genre),
        joinedload(Document.creator)  
    )

    if genre_id is not None:
        query = query.filter(Document.genre_id == genre_id)
        # エラー処理: ジャンルIDが存在しない場合
        if not db.query(Genre).filter(Genre.id == genre_id).first():
            raise HTTPException(status_code=404, detail="指定されたジャンルIDは存在しません")

    if status is not None:
        query = query.filter(Document.status == status)

    documents = query.order_by(Document.view_count.desc(), Document.created_at.desc()).offset(skip).limit(limit).all()

    # エラー処理: ドキュメントが見つからない場合
    if not documents:
        raise HTTPException(status_code=404, detail="該当するドキュメントが見つかりません")

    # ジャンル名と作成者名をレスポンスに追加
    result = []
    for document in documents:
        result.append({
            "id": document.id,
            "title": document.title,
            "content": document.content,
            "genre_id": document.genre_id,
            "genre_name": document.genre.name,  # ジャンル名
            "external_link": document.external_link,
            "status": document.status,
            "created_by": document.created_by,
            "creator_name": document.creator.name,  # 作成者名
            "created_at": document.created_at,
            "updated_by": document.updated_by,
            "updated_at": document.updated_at,
            "helpful_count": document.helpful_count,
            "view_count": document.view_count,
            "helpfulness_score": document.helpfulness_score,
            "keywords": []  # デフォルト値を空のリストに設定
        })

    return result