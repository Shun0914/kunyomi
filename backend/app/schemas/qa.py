from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.qa import QAStatus

class QAResponse(BaseModel):
    """
    QA情報返却用スキーマ（一覧表示・詳細表示共通）
    SQLAlchemyモデルのフィールドに加え、結合されたユーザー名も含みます。
    """
    id: int
    document_id: int
    
    # ユーザー属性: IDだけでなく表示用の名前を保持することでフロントエンドの負荷を軽減
    question_user_id: int
    question_user_name: Optional[str] = "不明なユーザー"  # 質問者の名前（初期値を設定）
    
    question_text: str
    answer_text: Optional[str] = None
    
    answer_user_id: Optional[int] = None
    answer_user_name: Optional[str] = None # 回答者の名前（未回答時はNone）
    
    status: QAStatus
    is_faq: bool
    created_at: datetime
    answered_at: Optional[datetime] = None

    # Pydantic V2 の設定: SQLAlchemyモデルからの直接変換（from_attributes）を許可
    model_config = ConfigDict(from_attributes=True)


class QACreateRequest(BaseModel):
    """
    質問作成リクエスト用スキーマ
    URLパスから document_id を受け取るため、リクエストボディは本文のみに集約しています。
    """
    question_text: str

    @field_validator('question_text')
    @classmethod
    def validate_question_text(cls, v: str) -> str:
        """質問本文のバリデーション: 必須チェック、空白のみの禁止、および文字数制限"""
        if not v or not v.strip():
            raise ValueError('質問内容は必須項目です。入力してください')
        if len(v) > 1000:
            raise ValueError('質問内容は1000文字以内で入力してください')
        return v.strip()


class QAAnswerRequest(BaseModel):
    """
    回答登録リクエスト用スキーマ
    回答本文と同時に、FAQセクションへの掲載フラグも制御可能です。
    """
    answer_text: str
    is_faq: Optional[bool] = False

    @field_validator('answer_text')
    @classmethod
    def validate_answer_text(cls, v: str) -> str:
        """回答本文のバリデーション: 必須チェックおよび余白削除"""
        if not v or not v.strip():
            raise ValueError('回答内容は必須項目です。入力してください')
        return v.strip()