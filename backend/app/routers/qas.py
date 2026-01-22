from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.db import get_db
from app.models.qa import QA, QAStatus
from app.models.document import Document
from app.models.user import User
from app.schemas.qa import QAResponse, QACreateRequest, QAAnswerRequest

router = APIRouter(tags=["qas"])

# 仮のユーザーID（認証機能実装までの暫定措置）
TEMP_USER_ID = 1

# ========== GET: QA取得系 ==========

@router.get("/api/documents/{document_id}/qas", response_model=List[QAResponse])
def read_qas(document_id: int, db: Session = Depends(get_db)):
    """
    指定されたドキュメントに紐づくQA一覧を取得します。
    UX向上のため、常に最新の質問がリストの最上部に表示されるよう降順でソートします。
    """
    # .order_by(QA.created_at.desc()) により最新の投稿をトップに配置
    qas = db.query(QA)\
            .filter(QA.document_id == document_id)\
            .order_by(QA.created_at.desc())\
            .all()
    
    # NOTE: パフォーマンス最適化（JOIN/N+1問題）の検討材料として、
    # 各QAごとにUserテーブルへクエリを発行して名前を取得しています。
    for qa in qas:
        # 質問者情報の補完
        q_user = db.query(User).filter(User.id == qa.question_user_id).first()
        qa.question_user_name = q_user.name if q_user else "匿名ユーザー"
        
        # 回答者情報の補完（回答が存在する場合のみ）
        if qa.answer_user_id:
            a_user = db.query(User).filter(User.id == qa.answer_user_id).first()
            qa.answer_user_name = a_user.name if a_user else "回答担当者"
            
    return qas

@router.get("/api/qas/{qa_id}", response_model=QAResponse)
def get_qa_detail(qa_id: int, db: Session = Depends(get_db)):
    """
    特定のQA詳細をユーザー名情報を含めて取得します。
    """
    qa = db.query(QA).filter(QA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="QAが見つかりませんでした")
    
    # レスポンス用にユーザー名を補完
    q_user = db.query(User).filter(User.id == qa.question_user_id).first()
    qa.question_user_name = q_user.name if q_user else "匿名ユーザー"
    
    if qa.answer_user_id:
        a_user = db.query(User).filter(User.id == qa.answer_user_id).first()
        qa.answer_user_name = a_user.name if a_user else "回答担当者"
        
    return qa

# ========== POST: 質問(Q)の登録 ==========

@router.post("/api/documents/{document_id}/qas", response_model=QAResponse, status_code=status.HTTP_201_CREATED)
def create_question(document_id: int, request: QACreateRequest, db: Session = Depends(get_db)):
    """
    ドキュメントに対する新規質問を登録します。
    """
    # 不整合防止：ドキュメントの存在を確認
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ID {document_id} のドキュメントは存在しません"
        )

    try:
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
        return new_qa
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"質問の登録に失敗しました: {str(e)}"
        )

# ========== PUT: 回答(A)の登録 ==========

@router.put("/api/qas/{qa_id}/answer", response_model=QAResponse)
def submit_answer(qa_id: int, request: QAAnswerRequest, db: Session = Depends(get_db)):
    """
    既存の質問に回答を登録し、ステータスを「回答済み」に更新します。
    """
    qa = db.query(QA).filter(QA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="対象の質問が見つかりませんでした")

    try:
        qa.answer_text = request.answer_text
        qa.answer_user_id = TEMP_USER_ID
        qa.status = QAStatus.ANSWERED
        qa.answered_at = datetime.now()
        
        # リクエストにFAQ設定が含まれる場合のみ上書き
        if request.is_faq is not None:
            qa.is_faq = request.is_faq

        db.commit()
        db.refresh(qa)
        return qa
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"回答の登録に失敗しました: {str(e)}"
        )