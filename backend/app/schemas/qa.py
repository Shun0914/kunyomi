from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from datetime import datetime
from typing import Optional, Any
from app.models.qa import QAStatus

class QAResponse(BaseModel):
    """
    QA情報返却用スキーマ（一覧表示・詳細表示共通）
    SQLAlchemyモデルからPydanticモデルへの変換をサポートします。
    """
    id: int
    document_id: int
    question_user_id: int
    question_text: str
    answer_text: Optional[str]
    answer_user_id: Optional[int]
    status: QAStatus
    is_faq: bool
    created_at: datetime
    answered_at: Optional[datetime]

    # ORMモデル（SQLAlchemy）からデータを読み込むための設定
    model_config = ConfigDict(from_attributes=True)


class QACreateRequest(BaseModel):
    """
    質問作成リクエスト用スキーマ
    NOTE: URLパスパラメータから document_id を取得する設計に変更したため、
    リクエストボディからは document_id を除外しています。
    """
    question_text: str

    @field_validator('question_text')
    @classmethod
    def validate_question_text(cls, v: str) -> str:
        """質問本文のバリデーション: 必須チェックおよび文字数制限"""
        if not v or not v.strip():
            raise ValueError('質問内容は必須項目です。入力してください')
        if len(v) > 1000:
            raise ValueError('質問内容は1000文字以内で入力してください')
        return v.strip()


class QAAnswerRequest(BaseModel):
    """
    回答登録リクエスト用スキーマ
    管理画面または詳細画面からの回答投稿に使用します。
    """
    answer_text: str
    is_faq: Optional[bool] = False

    @field_validator('answer_text')
    @classmethod
    def validate_answer_text(cls, v: str) -> str:
        """回答本文のバリデーション: 必須チェック"""
        if not v or not v.strip():
            raise ValueError('回答内容は必須項目です。入力してください')
        return v.strip()