from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models.document import Document
from app.schemas.document import DocumentDetailResponse

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_detail(document_id: int, db: Session = Depends(get_db)):
    """
    ドキュメント詳細取得:
    - keywords も含めて返す
    - view_count を +1
    - 存在しないIDは 404
    """
    doc = (
        db.query(Document)
        .options(joinedload(Document.keywords))
        .filter(Document.id == document_id)
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 閲覧数インクリメント
    doc.view_count += 1
    db.commit()
    db.refresh(doc)

    return doc
