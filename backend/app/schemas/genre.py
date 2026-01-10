# backend/app/schemas/genres.py

from pydantic import BaseModel
from datetime import datetime
from typing import List

class GenreResponse(BaseModel):
    """ジャンルレスポンススキーマ（基本情報）"""
    id: int
    name: str
    parent_id: int | None
    level: int
    path: str
    display_order: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class GenreWithChildren(GenreResponse):
    """子ジャンルを含むジャンルレスポンススキーマ（階層構造）"""
    children: List['GenreWithChildren'] = []
    
    class Config:
        from_attributes = True

# 再帰参照を解決（重要！）
GenreWithChildren.model_rebuild()