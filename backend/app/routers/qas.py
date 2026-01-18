from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.db import get_db
from app.models.qa import QA, QAStatus
from app.models.document import Document
from app.schemas.qa import QAResponse, QACreateRequest, QAAnswerRequest

# NOTE: ドキュメント詳細画面内での利用を想定し、ドキュメントリソースの下にQAを配置する階層構造に変更
# prefixは各エンドポイントで明示的に定義（/api/documents/{id}/qas と /api/qas/{id} が混在するため）
router = APIRouter(tags=["qas"])

# 仮のユーザーID（認証機能実装までの暫定措置）
TEMP_USER_ID = 1

# ========== GET: QA取得系 ==========

@router.get("/api/documents/{document_id}/qas", response_model=List[QAResponse])
def get_qas_by_document(document_id: int, db: Session = Depends(get_db)):
    """
    特定のドキュメントに関連付けられたQA一覧を取得します。
    フロントエンドのドキュメント詳細画面下部での表示に使用します。
    """
    # 新着順（created_at desc）で取得
    qas = db.query(QA).filter(QA.document_id == document_id).order_by(QA.created_at.desc()).all()
    return qas

@router.get("/api/qas/{qa_id}", response_model=QAResponse)
def get_qa_detail(qa_id: int, db: Session = Depends(get_db)):
    """
    QAの個別詳細を取得します。
    特定の質問へのダイレクトリンクや、通知からの遷移を想定しています。
    """
    qa = db.query(QA).filter(QA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="QAが見つかりませんでした")
    return qa

# ========== POST: 質問(Q)の登録 ==========

@router.post("/api/documents/{document_id}/qas", response_model=QAResponse, status_code=status.HTTP_201_CREATED)
def create_question(document_id: int, request: QACreateRequest, db: Session = Depends(get_db)):
    """
    ドキュメントに対して新しい質問を投稿します。
    - パスパラメータ: document_id（どのドキュメントに対する質問か）
    - ボディ: question_text（質問内容）
    """
    # 1. 対象ドキュメントの存在確認（不整合なデータの登録を防止）
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ID {document_id} のドキュメントは存在しません"
        )

    try:
        new_qa = QA(
            document_id=document_id, # パスパラメータから紐付けを担保
            question_user_id=TEMP_USER_ID,
            question_text=request.question_text,
            status=QAStatus.PENDING, # 初期状態は「回答待ち」
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
    既存の質問に対して回答を登録します。
    - ステータスを 'answered' に変更
    - 回答者IDと回答日時を自動記録
    - is_faq フラグの更新にも対応
    """
    qa = db.query(QA).filter(QA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="対象の質問が見つかりませんでした")

    try:
        qa.answer_text = request.answer_text
        qa.answer_user_id = TEMP_USER_ID
        qa.status = QAStatus.ANSWERED
        qa.answered_at = datetime.now()
        
        # クライアントから明示的に指定がある場合のみ更新
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