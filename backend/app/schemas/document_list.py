from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    genre_id: int
    genre_name: str  # ジャンル名を追加
    external_link: str | None = None
    status: DocumentStatus
    created_by: int
    creator_name: str  # 作成者名を追加
    created_at: datetime
    updated_by: int | None = None
    updated_at: datetime
    helpful_count: int
    view_count: int
    helpfulness_score: Decimal
    keywords: Optional[List[dict]] = None  # キーワードをオプションに設定

    class Config:
        from_attributes = True  # SQLAlchemyモデルから自動変換
