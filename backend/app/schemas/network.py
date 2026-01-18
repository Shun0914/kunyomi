# backend/app/schemas/network.py

from pydantic import BaseModel
from typing import List, Literal

class NetworkNode(BaseModel):
    """ネットワークグラフのノード"""
    id: str  # "genre_1" or "doc_123"
    label: str  # 表示名
    type: Literal["genre", "document"]  # ノードタイプ
    genre_id: int | None = None  # ジャンルID（ジャンルノードのみ）
    document_id: int | None = None  # ドキュメントID（ドキュメントノードのみ）
    level: int | None = None  # 階層レベル（ジャンルのみ）
    document_count: int = 0  # 紐づくドキュメント数（ジャンルのみ）
    view_count: int = 0  # 閲覧数（ドキュメントのみ）
    helpful_count: int = 0  # 役立った数（ドキュメントのみ）
    
    class Config:
        from_attributes = True

class NetworkLink(BaseModel):
    """ネットワークグラフのリンク（エッジ）"""
    source: str  # ソースノードID
    target: str  # ターゲットノードID
    type: Literal["genre_hierarchy", "genre_document"]  # リンクタイプ
    
    class Config:
        from_attributes = True

class NetworkGraphResponse(BaseModel):
    """ネットワークグラフレスポンス"""
    nodes: List[NetworkNode]
    links: List[NetworkLink]
    
    class Config:
        from_attributes = True