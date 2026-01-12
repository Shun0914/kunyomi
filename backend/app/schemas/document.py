# backend/app/schemas/document.py
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import List, Optional, Any

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


class DocumentCreateRequest(BaseModel):
    """ドキュメント作成リクエスト"""
    # Fieldには制約を一切つけない（すべてカスタムバリデーターで処理）
    title: str
    content: str
    genre_id: int
    external_link: Optional[str] = None
    keywords: List[str] = []
    
    @model_validator(mode='before')
    @classmethod
    def check_required_fields(cls, data: Any) -> Any:
        """必須フィールドのチェック"""
        if not isinstance(data, dict):
            return data
            
        errors = []
        
        # titleのチェック
        if 'title' not in data or data.get('title') is None:
            errors.append({
                'type': 'missing',
                'loc': ('title',),
                'msg': 'タイトルは必須項目です。入力してください',
                'input': None,
            })
        
        # contentのチェック
        if 'content' not in data or data.get('content') is None:
            errors.append({
                'type': 'missing',
                'loc': ('content',),
                'msg': '本文は必須項目です。入力してください',
                'input': None,
            })
        
        # genre_idのチェック
        if 'genre_id' not in data or data.get('genre_id') is None:
            errors.append({
                'type': 'missing',
                'loc': ('genre_id',),
                'msg': 'ジャンルは必須項目です。選択してください',
                'input': None,
            })
        
        if errors:
            from pydantic_core import ValidationError
            raise ValidationError.from_exception_data('DocumentCreateRequest', errors)
        
        return data
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """タイトルのバリデーション"""
        if not v or not v.strip():
            raise ValueError('タイトルは必須項目です。入力してください')
        if len(v) > 255:
            raise ValueError('タイトルは255文字以内で入力してください')
        return v.strip()
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v: str) -> str:
        """本文のバリデーション"""
        if not v or not v.strip():
            raise ValueError('本文は必須項目です。入力してください')
        return v.strip()
    
    @field_validator('genre_id')
    @classmethod
    def validate_genre_id(cls, v: int) -> int:
        """ジャンルIDのバリデーション"""
        if v is None or v <= 0:
            raise ValueError('ジャンルは必須項目です。選択してください')
        return v
    
    @field_validator('external_link')
    @classmethod
    def validate_external_link(cls, v: Optional[str]) -> Optional[str]:
        """外部リンクのバリデーション"""
        if v and len(v) > 500:
            raise ValueError('外部リンクは500文字以内で入力してください')
        return v
    
    @field_validator('keywords')
    @classmethod
    def validate_keywords(cls, v: List[str]) -> List[str]:
        """キーワードのバリデーション"""
        # 空文字列を除外
        cleaned = [k.strip() for k in v if k and k.strip()]
        
        # 最大3個チェック
        if len(cleaned) > 3:
            raise ValueError('キーワードは最大3個までです')
        
        # キーワードは任意なので、0個でもOK
        return cleaned


class DocumentCreateResponse(BaseModel):
    """ドキュメント作成レスポンス"""
    id: int
    title: str
    content: str
    genre_id: int
    external_link: Optional[str]
    status: str
    created_by: int
    created_at: datetime
    keywords: List[KeywordResponse]
    
    class Config:
        from_attributes = True