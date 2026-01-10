from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from app.schemas.keyword import KeywordResponse


class DocumentDetailResponse(BaseModel):
    id: int
    title: str
    content: str
    genre_id: int
    external_link: Optional[str]
    status: str

    created_by: int
    created_at: datetime
    updated_by: Optional[int]
    updated_at: datetime

    helpful_count: int
    view_count: int
    helpfulness_score: float

    keywords: List[KeywordResponse]

    class Config:
        from_attributes = True
