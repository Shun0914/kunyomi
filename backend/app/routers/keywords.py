from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
import unicodedata

from app.db import get_db
from app.models.keyword import Keyword
from app.schemas.keyword import KeywordResponse

router = APIRouter(prefix="/api/keywords", tags=["keywords"])


def normalize_text(s: str) -> str:
    """
    正規化処理：
    - NFKC Normalize
    - ケースフォールディング
    """
    return unicodedata.normalize("NFKC", s).casefold()


@router.get("", response_model=List[KeywordResponse])
def list_keywords(db: Session = Depends(get_db)):
    """キーワード一覧を取得（使用回数順）"""
    return db.query(Keyword).order_by(Keyword.usage_count.desc()).all()


@router.get("/search", response_model=List[KeywordResponse])
def search_keywords(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    """キーワード検索（正規化して normalized_name に対して検索、使用回数順）"""
    nq = normalize_text(q)

    return (
        db.query(Keyword)
        .filter(Keyword.normalized_name.like(f"%{nq}%"))
        .order_by(Keyword.usage_count.desc())
        .all()
    )
