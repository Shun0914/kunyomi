import os
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.db import get_db
from app.models.qa import QA, QAStatus
from app.models.document import Document
from app.models.user import User
from app.schemas.qa import QAResponse, QACreateRequest, QAAnswerRequest
from app.utils.notifier import send_notification_email
from dotenv import load_dotenv

router = APIRouter(tags=["qas"])

# 仮のユーザーID（認証機能実装までの暫定措置）
TEMP_USER_ID = 1

load_dotenv() # .envがあれば読み込む

# 環境変数からフロントエンドのURLを取得（未設定時のデフォルトは localhost:3000）
# Azureの設定（FRONTEND_URL）が優先されます
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# ========== GET: QA取得系 ==========

@router.get("/api/documents/{document_id}/qas", response_model=List[QAResponse])
def read_qas(document_id: int, db: Session = Depends(get_db)):
    """
    指定されたドキュメントに紐づくQA一覧を最新順で取得し、ユーザー名を補完します。
    """
    qas = db.query(QA)\
            .filter(QA.document_id == document_id)\
            .order_by(QA.created_at.desc())\
            .all()
    
    for qa in qas:
        q_user = db.query(User).filter(User.id == qa.question_user_id).first()
        qa.question_user_name = q_user.name if q_user else "匿名ユーザー"
        
        if qa.answer_user_id:
            a_user = db.query(User).filter(User.id == qa.answer_user_id).first()
            qa.answer_user_name = a_user.name if a_user else "回答担当者"
            
    return qas

# ========== POST: 質問(Q)の登録 ==========

@router.post("/api/documents/{document_id}/qas", response_model=QAResponse, status_code=status.HTTP_201_CREATED)
def create_question(
    document_id: int, 
    request: QACreateRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    質問を登録し、ドキュメント所有者へバックグラウンドでメール通知を行います。
    """
    # 1. バリデーション：ドキュメントの存在確認
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ID {document_id} のドキュメントは存在しません"
        )

    try:
        # 2. 質問の保存
        new_qa = QA(
            document_id=document_id,
            question_user_id=TEMP_USER_ID,
            question_text=request.question_text,
            status=QAStatus.PENDING,
            is_faq=False,
            created_at=datetime.now()
        )
        db.add(new_qa)
        db.commit()
        db.refresh(new_qa)

        # 3. 通知処理の予約（BackgroundTasks）
        # DBへの保存完了後に実行。メール送信の遅延がレスポンス速度に影響しないようにします。

        # doc.creator により、作成者(Userモデル)を直接取得
        owner = doc.creator
        if owner and owner.email:
            # ドキュメント詳細へのリンクを作成
            qa_link = f"{FRONTEND_URL}/documents/{document_id}"

            background_tasks.add_task(
                send_notification_email,
                to_email=owner.email,
                subject=f"【通知】{doc.title} に新しい質問が届きました",
                body=(
                f"新しい質問内容: {request.question_text}\n\n"
                f"▼以下のリンクから回答してください\n"
                f"{qa_link}"
                )
            )

        return new_qa

    except Exception as e:
        db.rollback()
        # 予期せぬエラーの場合のみ詳細ログを表示
        import traceback
        traceback.print_exc() 

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"質問の登録に失敗しました: {str(e)}"
        )

# ========== PUT: 回答(A)の登録 ==========

@router.put("/api/qas/{qa_id}/answer", response_model=QAResponse)
def submit_answer(
    qa_id: int, 
    request: QAAnswerRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    回答を登録し、質問者へバックグラウンドでメール通知を行います。
    """
    # 1. 対象質問の存在確認
    qa = db.query(QA).filter(QA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="対象の質問が見つかりませんでした")

    try:
        # 2. 回答内容の更新
        qa.answer_text = request.answer_text
        qa.answer_user_id = TEMP_USER_ID
        qa.status = QAStatus.ANSWERED
        qa.answered_at = datetime.now()
        
        if request.is_faq is not None:
            qa.is_faq = request.is_faq

        db.commit()
        db.refresh(qa)

        # 3. 通知処理の予約（BackgroundTasks）
        # 質問を投稿したユーザーへ回答が届いたことを知らせます。
        question_user = db.query(User).filter(User.id == qa.question_user_id).first()
        doc = db.query(Document).filter(Document.id == qa.document_id).first()

        if question_user and hasattr(question_user, 'email') and question_user.email:
            # 同じくドキュメント詳細へのリンクを作成
            qa_link = f"{FRONTEND_URL}/documents/{qa.document_id}"
        
            background_tasks.add_task(
                send_notification_email,
                to_email=question_user.email,
                subject=f"【通知】{doc.title}の質問に回答が届きました",
                body=(
                f"ドキュメント: {doc.title}\n"
                f"回答内容: {request.answer_text}\n\n"
                f"▼以下のリンクから確認してください\n"
                f"{qa_link}"
                )
            )

        return qa

    except Exception as e:
        # 通知処理で失敗しても、DB保存は終わっているのでエラーログを出すのみにする
        print(f"回答通知予約エラー: {str(e)}")
        return qa