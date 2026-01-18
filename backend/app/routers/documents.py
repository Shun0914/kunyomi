from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.models.document_evaluation import DocumentEvaluation
from datetime import datetime

from app.db import get_db
from app.models.document import Document, DocumentStatus
from app.models.keyword import Keyword
from app.models.document_keyword import DocumentKeyword
from app.models.genre import Genre
from app.schemas.document import (
    DocumentDetailResponse, 
    DocumentCreateRequest,
    DocumentCreateResponse,
    DocumentEvaluateRequest,
    )
from app.routers.keywords import normalize_text

router = APIRouter(prefix="/api/documents", tags=["documents"])

# 仮のユーザーID（認証機能がないため）
TEMP_USER_ID = 1

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.id.desc()).all()


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_detail(document_id: int, db: Session = Depends(get_db)):
    """
    ドキュメント詳細取得:
    - keywords も含めて返す
    - view_count を +1
    - 存在しないIDは 404
    """
    doc = (
        db.query(Document)
        .options(joinedload(Document.keywords))
        .filter(Document.id == document_id)
        .first()
    )

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 閲覧数インクリメント
    #doc.view_count += 1
    #db.commit()
    #db.refresh(doc)

    return doc

@router.post("/{document_id}/view", status_code=status.HTTP_204_NO_CONTENT)
def increment_view_count(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.view_count += 1
    denominator = max(doc.view_count, 1)
    doc.helpfulness_score = round(doc.helpful_count / denominator, 2)

    db.commit()
    return

@router.post("/{document_id}/evaluate", response_model=DocumentDetailResponse)
def evaluate_document(
    document_id: int,
    request: DocumentEvaluateRequest,
    db: Session = Depends(get_db),
):
    """
    ドキュメント評価:
    - リクエスト { "is_helpful": true/false }
    - 1ユーザー1ドキュメントにつき1回まで（重複は409）
    - Document.helpful_count と Document.helpfulness_score を即時更新
    """
    # 1) ドキュメント存在確認（keywordsも返せるように）
    doc = (
        db.query(Document)
        .options(joinedload(Document.keywords))
        .filter(Document.id == document_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2) 既存評価チェック（重複防止）
    existing = (
        db.query(DocumentEvaluation)
        .filter(
            DocumentEvaluation.document_id == document_id,
            DocumentEvaluation.user_id == TEMP_USER_ID,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already evaluated")

    # 3) 評価レコード作成
    evaluation = DocumentEvaluation(
        document_id=document_id,
        user_id=TEMP_USER_ID,
        is_helpful=request.is_helpful,
    )
    db.add(evaluation)

    # 4) 集計更新（役立った=true のときだけカウント）
    if request.is_helpful:
        doc.helpful_count += 1

    denominator = max(doc.view_count, 1)
    doc.helpfulness_score = round(doc.helpful_count / denominator, 2)

    # 5) 保存（unique違反は409へ）
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already evaluated")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate document: {str(e)}",
        )

    db.refresh(doc)
    return doc


# ========== POSTエンドポイント ==========
@router.post("/", response_model=DocumentCreateResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    request: DocumentCreateRequest,
    db: Session = Depends(get_db)
):
    """
    新しいドキュメントを作成
    
    - **title**: タイトル（必須、1-255文字）
    - **content**: 本文（必須、Markdown対応）
    - **genre_id**: ジャンルID（必須）
    - **external_link**: 外部リンク（オプション）
    - **keywords**: キーワードリスト（最大3個）
    
    Returns:
        DocumentCreateResponse: 作成されたドキュメント情報
        
    Raises:
        HTTPException: ジャンルが存在しない場合（400）
        HTTPException: キーワードが3個を超える場合（400）
    """
    try:
        # 1. ジャンルの存在確認
        genre = db.query(Genre).filter(Genre.id == request.genre_id).first()
        if not genre:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Genre with id {request.genre_id} not found"
            )
        
        # 2. ドキュメント作成
        new_document = Document(
            title=request.title,
            content=request.content,
            genre_id=request.genre_id,
            external_link=request.external_link,
            status=DocumentStatus.PUBLISHED,
            created_by=TEMP_USER_ID,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            helpful_count=0,
            view_count=0,
            helpfulness_score=0.0
        )
        db.add(new_document)
        db.flush()  # IDを取得
        
        # 3. キーワード処理
        for keyword_name in request.keywords:
            keyword = process_keyword(db, keyword_name)
            
            # ドキュメントとキーワードの紐付け
            doc_keyword = DocumentKeyword(
                document_id=new_document.id,
                keyword_id=keyword.id,
                created_at=datetime.now()
            )
            db.add(doc_keyword)
        
        # 4. コミット
        db.commit()
        db.refresh(new_document)
        
        # 5. レスポンス用にキーワードを取得
        stmt = (
            select(Document)
            .options(joinedload(Document.keywords))
            .where(Document.id == new_document.id)
        )
        result = db.execute(stmt)
        document_with_keywords = result.unique().scalar_one()
        
        return document_with_keywords
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document: {str(e)}"
        )


def process_keyword(db: Session, keyword_name: str) -> Keyword:
    """
    キーワードを処理（既存なら取得、新規なら作成）
    
    Args:
        db: データベースセッション
        keyword_name: キーワード名
        
    Returns:
        Keyword: キーワードオブジェクト
    """
    # ========== keywords.py の normalize_text() を使用 ==========
    normalized_name = normalize_text(keyword_name)
    
    # 既存キーワードを検索
    keyword = db.query(Keyword).filter(
        Keyword.normalized_name == normalized_name
    ).first()
    
    if keyword:
        # 既存キーワード：使用回数をインクリメント
        keyword.usage_count += 1
    else:
        # 新規キーワード：作成
        keyword = Keyword(
            name=keyword_name,
            normalized_name=normalized_name,
            usage_count=1,
            created_at=datetime.now()
        )
        db.add(keyword)
        db.flush()  # IDを取得
    
    return keyword