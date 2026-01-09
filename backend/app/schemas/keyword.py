from pydantic import BaseModel
from datetime import datetime


class KeywordResponse(BaseModel):
    id: int
    name: str
    usage_count: int
    created_at: datetime

    class Config:
        from_attributes = True
