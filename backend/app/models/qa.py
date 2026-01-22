import enum
import sqlalchemy as sa
from sqlalchemy import Column, BigInteger, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class QAStatus(str, enum.Enum):
    """
    QAの対応ステータス定義
    - PENDING: 質問投稿直後（未回答）
    - ANSWERED: 回答済み
    - CLOSED: 解決済み・クローズ
    """
    PENDING = "pending"
    ANSWERED = "answered"
    CLOSED = "closed"

class QA(Base):
    """
    ナレッジ（Document）に対する質疑応答を管理するモデル
    """
    __tablename__ = "qas"

    # --- 基本情報 ---
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # 関連ドキュメント：ドキュメント削除時はQAも一括削除(CASCADE)
    document_id = Column(
        BigInteger, 
        ForeignKey("documents.id", ondelete="CASCADE"), 
        nullable=False,
        comment="紐づくドキュメントID"
    )
    
    # --- 質問内容 ---
    question_user_id = Column(
        BigInteger, 
        ForeignKey("users.id"), 
        nullable=False,
        comment="質問したユーザー"
    )
    question_text = Column(Text, nullable=False, comment="質問本文")
    
    # --- 回答内容 ---
    answer_text = Column(Text, nullable=True, comment="回答本文（未回答時はnull）")
    answer_user_id = Column(
        BigInteger, 
        ForeignKey("users.id"), 
        nullable=True,
        comment="回答したユーザー"
    )
    
    # --- 状態・フラグ ---
    # フロントエンドのバッジ表示判定に使用（pending/answered）
    status = Column(
        Enum(QAStatus), 
        nullable=False, 
        server_default="PENDING", 
        comment="対応ステータス"
    )
    
    # 頻出する質問としてピックアップされた場合True
    is_faq = Column(
        Boolean, 
        nullable=False, 
        server_default=sa.text("0"),
        comment="FAQフラグ"
    )
    
    # --- タイムスタンプ ---
    created_at = Column(
        DateTime, 
        nullable=False, 
        server_default=func.now(),
        comment="質問投稿日時"
    )
    answered_at = Column(
        DateTime, 
        nullable=True,
        comment="回答日時"
    )

    # --- リレーションシップ ---
    document = relationship("Document", back_populates="qas")
    # 同一テーブル(User)への複数の外部キーがあるため、明示的に参照カラムを指定
    question_user = relationship("User", foreign_keys=[question_user_id])
    answer_user = relationship("User", foreign_keys=[answer_user_id])

    def __repr__(self):
        return f"<QA(id={self.id}, document_id={self.document_id}, status='{self.status}')>"