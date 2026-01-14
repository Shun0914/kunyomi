from pydantic import BaseModel, Field
from datetime import datetime


class KeywordResponse(BaseModel):
    id: int
    name: str
    usage_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class KeywordCreateRequest(BaseModel):
    """キーワード作成リクエスト"""
    name: str = Field(..., min_length=1, max_length=50)
