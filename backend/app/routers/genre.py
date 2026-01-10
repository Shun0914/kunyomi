# backend/app/routers/genres.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db  # あなたのプロジェクトは app.db を使用
from app.models.genre import Genre
from app.schemas.genre import GenreResponse, GenreWithChildren

router = APIRouter(
    prefix="/api/genres",
    tags=["genres"]
)


@router.get("/", response_model=List[GenreWithChildren])
def get_genres(db: Session = Depends(get_db)):
    """
    ジャンル一覧を階層構造で取得
    
    L1ジャンル（最上位）のみを取得し、
    各L1に紐づくL2、L3も含めて返す。
    display_orderで自動的にソート済み。
    is_active=Trueのジャンルのみ取得。
    """
    try:
        # L1ジャンル（parent_id=NULL）でis_active=Trueのみ
        top_level_genres = db.query(Genre).filter(
            Genre.parent_id == None,
            Genre.is_active == True
        ).order_by(Genre.display_order).all()
        
        return top_level_genres
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ジャンル取得エラー: {str(e)}"
        )


@router.get("/flat", response_model=List[GenreResponse])
def get_genres_flat(db: Session = Depends(get_db)):
    """
    全ジャンルをフラットなリストで取得（階層なし）
    
    level と display_order でソート済み。
    フォームのセレクトボックスで使いやすい形式。
    is_active=Trueのジャンルのみ取得。
    """
    try:
        all_genres = db.query(Genre).filter(
            Genre.is_active == True
        ).order_by(
            Genre.level,
            Genre.display_order
        ).all()
        
        return all_genres
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ジャンル取得エラー: {str(e)}"
        )


@router.get("/{genre_id}", response_model=GenreWithChildren)
def get_genre_by_id(
    genre_id: int,
    db: Session = Depends(get_db)
):
    """
    指定IDのジャンルを取得（子ジャンル含む）
    
    is_active=Trueのジャンルのみ取得。
    """
    genre = db.query(Genre).filter(
        Genre.id == genre_id,
        Genre.is_active == True
    ).first()
    
    if not genre:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ジャンルID {genre_id} が見つかりません"
        )
    
    return genre