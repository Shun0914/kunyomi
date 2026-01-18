# backend/app/routers/network.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from typing import List

from app.db import get_db
from app.models.genre import Genre
from app.models.document import Document
from app.schemas.network import NetworkGraphResponse, NetworkNode, NetworkLink

router = APIRouter(
    prefix="/api/network",
    tags=["network"]
)


def _build_genre_nodes_and_links(
    genres: List[Genre],
    nodes: List[NetworkNode],
    links: List[NetworkLink],
    genre_doc_counts: dict,
    parent_id: str | None = None
) -> None:
    """
    ジャンルノードとリンクを再帰的に構築
    
    Args:
        genres: ジャンルリスト
        nodes: ノードリスト（参照渡しで追加）
        links: リンクリスト（参照渡しで追加）
        genre_doc_counts: ジャンルIDごとのドキュメント数
        parent_id: 親ノードID
    """
    for genre in genres:
        genre_node_id = f"genre_{genre.id}"
        
        # ジャンルノード追加（レベルとドキュメント数を含む）
        nodes.append(NetworkNode(
            id=genre_node_id,
            label=genre.name,
            type="genre",
            genre_id=genre.id,
            level=genre.level,
            document_count=genre_doc_counts.get(genre.id, 0)
        ))
        
        # 親がいればリンク追加（ジャンル階層）
        if parent_id:
            links.append(NetworkLink(
                source=parent_id,
                target=genre_node_id,
                type="genre_hierarchy"
            ))
        
        # 子ジャンルを再帰処理
        if genre.children:
            _build_genre_nodes_and_links(
                genre.children,
                nodes,
                links,
                genre_doc_counts,
                parent_id=genre_node_id
            )


@router.get("/graph", response_model=NetworkGraphResponse)
def get_network_graph(
    genre_id: int | None = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    ナレッジベースのネットワークグラフを取得
    
    【用途】
    - ネットワーク図でのジャンル・ドキュメント可視化
    - Obsidian風のグラフビュー
    
    【クエリパラメータ】
    - genre_id: 特定ジャンルのみ取得（指定しない場合は全体）
    - include_inactive: 無効なジャンル・ドキュメントも含めるか
    
    【レスポンス】
    - nodes: ジャンルノード + ドキュメントノード
    - links: ジャンル階層リンク + ジャンル-ドキュメントリンク
    """
    try:
        nodes: List[NetworkNode] = []
        links: List[NetworkLink] = []
        
        # ===============================
        # 0. ジャンルごとのドキュメント数をカウント（階層考慮）
        # ===============================
        # 全ジャンルを取得（pathを使って配下のドキュメントをカウントするため）
        all_genres = db.query(Genre).all()
        
        genre_doc_counts = {}
        for genre in all_genres:
            # このジャンルのpathまたはその配下のジャンルに紐づくドキュメントをカウント
            count_query = db.query(func.count(Document.id)).join(Genre).filter(
                (Genre.path == genre.path) | (Genre.path.like(f"{genre.path}/%"))
            )
            
            if not include_inactive:
                count_query = count_query.filter(Document.status == "published")
            
            genre_doc_counts[genre.id] = count_query.scalar() or 0
        
        # ===============================
        # 1. ジャンルノード・リンク構築
        # ===============================
        if genre_id:
            # 特定ジャンルのみ取得
            query = db.query(Genre).filter(Genre.id == genre_id)
        else:
            # 全ジャンル取得（トップレベルから）
            query = db.query(Genre).filter(Genre.parent_id == None)
        
        # is_activeフィルター
        if not include_inactive:
            query = query.filter(Genre.is_active == True)
        
        # 3階層まで効率的に取得
        query = query.options(
            selectinload(Genre.children)
            .selectinload(Genre.children)
        )
        
        genres = query.order_by(Genre.display_order).all()
        
        # ジャンルノード・リンクを再帰的に構築（ドキュメント数を含む）
        _build_genre_nodes_and_links(genres, nodes, links, genre_doc_counts)
        
        # ===============================
        # 2. ドキュメントノード・リンク構築
        # ===============================
        doc_query = db.query(Document)
        
        # 特定ジャンルの場合、そのジャンル配下のドキュメントのみ
        if genre_id:
            # パスを使ってサブジャンルも含める
            genre = db.query(Genre).filter(Genre.id == genre_id).first()
            if not genre:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"ジャンルID {genre_id} が見つかりません"
                )
            # 例: path="1/5/23" → "1/5/23" または "1/5/23/%" にマッチ
            doc_query = doc_query.join(Genre).filter(
                (Genre.path == genre.path) | (Genre.path.like(f"{genre.path}/%"))
            )
        
        # is_activeフィルター（ドキュメントのステータス）
        if not include_inactive:
            doc_query = doc_query.filter(Document.status == "published")
        
        documents = doc_query.all()
        
        # ドキュメントノード・リンク追加
        for doc in documents:
            doc_node_id = f"doc_{doc.id}"
            genre_node_id = f"genre_{doc.genre_id}"
            
            # ドキュメントノード追加
            nodes.append(NetworkNode(
                id=doc_node_id,
                label=doc.title,
                type="document",
                document_id=doc.id,
                view_count=doc.view_count,
                helpful_count=doc.helpful_count
            ))
            
            # ジャンル-ドキュメントリンク追加
            links.append(NetworkLink(
                source=genre_node_id,
                target=doc_node_id,
                type="genre_document"
            ))
        
        return NetworkGraphResponse(
            nodes=nodes,
            links=links
        )
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"データベースエラー: {str(e)}"
        )