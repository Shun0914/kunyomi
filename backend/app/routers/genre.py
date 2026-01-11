from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db import get_db
from app.models.genre import Genre
from app.schemas.genre import GenreResponse, GenreWithChildren

router = APIRouter(
    prefix="/api/genres",
    tags=["genres"]
)


def _filter_children(genre: Genre, include_inactive: bool) -> None:
    """
    子要素から無効なジャンルを除外（再帰的）
    
    この関数は階層の深さに関係なく動作し、
    include_inactive=Falseの場合、is_active=Falseの子孫を全て除外する
    """
    if not include_inactive:
        genre.children = [c for c in genre.children if c.is_active]
    
    # 再帰的に全ての子孫に適用
    for child in genre.children:
        _filter_children(child, include_inactive)


@router.get("/", response_model=List[GenreWithChildren])
def get_genres(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    ジャンル一覧を階層構造で取得
    
    【用途】
    - サイドバーでのツリー表示
    - ネットワーク図などの視覚化
    
    【クエリパラメータ】
    - include_inactive: 無効なジャンルも含めるか（デフォルト: False）
    
    【レスポンス】
    親ジャンルとその子・孫を含むネスト構造
    """
    try:
        # トップレベルのジャンルのみ取得
        query = db.query(Genre).filter(Genre.parent_id == None)
        
        # 親レベルでis_activeフィルター適用
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        # 3階層まで効率的に取得（selectinloadでN+1問題を回避）
        query = query.options(
            selectinload(Genre.children)
            .selectinload(Genre.children)
        )
        
        top_level_genres = query.order_by(Genre.display_order).all()
        
        # 子要素にもis_activeフィルターを再帰的に適用
        for genre in top_level_genres:
            _filter_children(genre, include_inactive)
        
        return top_level_genres
        
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラー: {str(e)}"
        )


@router.get("/flat", response_model=List[GenreResponse])
def get_genres_flat(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    全ジャンルをフラットなリストで取得
    
    【用途】
    - ドロップダウンでのジャンル選択
    - ジャンル一覧表示
    - フロントエンドでの自由なフィルタリング
    
    【クエリパラメータ】
    - include_inactive: 無効なジャンルも含めるか（デフォルト: False）
    
    【レスポンス】
    全ジャンルをlevel、display_orderでソートした配列
    階層構造は保持されない（parent_idで判断可能）
    """
    try:
        query = db.query(Genre)
        
        # is_activeフィルター適用
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        # level、display_orderでソート（階層順に並ぶ）
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
    
    【用途】
    - ジャンル詳細画面
    - ジャンル編集画面
    - ナレッジ詳細でのジャンル情報表示
    
    【パスパラメータ】
    - genre_id: ジャンルID
    
    【クエリパラメータ】
    - include_inactive: 無効なジャンルも含めるか（デフォルト: False）
    
    【レスポンス】
    指定されたジャンルとその子・孫を含むネスト構造
    
    【エラー】
    - 404: 指定IDのジャンルが存在しない、または無効
    """
    try:
        query = db.query(Genre).filter(Genre.id == genre_id)
        
        # 指定ジャンル自体にis_activeフィルター適用
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        # 3階層まで効率的に取得
        query = query.options(
            selectinload(Genre.children)
            .selectinload(Genre.children)
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
        
        # 子要素にもis_activeフィルターを再帰的に適用
        _filter_children(genre, include_inactive)
        
        return genre
        
    except HTTPException:
        # HTTPExceptionはそのまま投げる
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラー: {str(e)}"
        )