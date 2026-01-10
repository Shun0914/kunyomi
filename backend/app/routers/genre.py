# backend/app/routers/genres.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db import get_db
from app.models.genre import Genre
from app.schemas.genre import GenreResponse, GenreWithChildren

router = APIRouter(
    prefix="/api/genres",
    tags=["genres"]
)


@router.get("/", response_model=List[GenreWithChildren])
def get_genres(
    include_inactive: bool = False,  # クエリパラメータ
    db: Session = Depends(get_db)
):
    """
    ジャンル一覧を階層構造で取得
    
    クエリパラメータ:
    - include_inactive: 無効なジャンルも含めるか（デフォルト: False）
    """
    try:
        query = db.query(Genre).filter(Genre.parent_id == None)
        
        # include_inactiveがFalseなら有効なジャンルのみ
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        # Eager Loading（N+1問題を防ぐ）
        query = query.options(
            joinedload(Genre.children).joinedload(Genre.children)
        )
        
        top_level_genres = query.order_by(Genre.display_order).all()
        
        return top_level_genres
        
    except SQLAlchemyError as e:  # 具体的な例外をキャッチ
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラー: {str(e)}"
        )


@router.get("/flat", response_model=List[GenreResponse])
def get_genres_flat(
    include_inactive: bool = False,
    level: int | None = None,        # レベル指定
    db: Session = Depends(get_db)
):
    """
    全ジャンルをフラットなリストで取得
    
    クエリパラメータ:
    - include_inactive: 無効なジャンルも含めるか（デフォルト: False）
    - level: 特定のレベルのみ取得（1, 2, 3）
    """
    try:
        query = db.query(Genre)
        
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        # levelが指定されていたらそのレベルのみ(1-3以外は空が返ってくる)
        if level is not None:
            query = query.filter(Genre.level == level)
        
        all_genres = query.order_by(
            Genre.level,
            Genre.display_order
        ).all()
        
        return all_genres
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラー: {str(e)}"
        )


@router.get("/{genre_id}", response_model=GenreWithChildren)
def get_genre_by_id(
    genre_id: int,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    指定IDのジャンルを取得（子ジャンル含む）
    
    パスパラメータ:
    - genre_id: ジャンルID
    
    クエリパラメータ:
    - include_inactive: 無効なジャンルも含めるか（デフォルト: False）
    """
    try:
        query = db.query(Genre).filter(Genre.id == genre_id)
        
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        query = query.options(
            joinedload(Genre.children).joinedload(Genre.children)
        )
        
        genre = query.first()
        
        if not genre:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "message": "ジャンルが見つかりません",
                    "genre_id": genre_id,
                    "include_inactive": include_inactive
                }
            )
        
        return genre
        
    except HTTPException:
        # HTTPExceptionはそのまま投げる
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラー: {str(e)}"
        )