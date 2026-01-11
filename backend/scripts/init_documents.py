"""ドキュメントデータ投入スクリプト"""
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import SessionLocal, engine, Base
from app.models import Document
from datetime import datetime
from datetime import datetime, timedelta

def init_documents():
    """documents テーブルにテストデータを投入"""

    # テーブルが存在することを確認
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 既存データをチェック
        existing_count = db.query(Document).count()
        if existing_count > 0:
            print(f"既に {existing_count} 件のドキュメントデータが存在します。")
            response = input("既存データを削除して再投入しますか？ (y/N): ")
            if response.lower() == "y":
                db.query(Document).delete()
                db.commit()
                print("既存データを削除しました。")
            else:
                print("処理を中止しました。")
                return

        # テストデータ定義
        documents_data = [
            {
                "id": 1,
                "title": "初めてのドキュメント",
                "content": "これはテスト用のドキュメントです。",
                "genre_id": 1,
                "external_link": None,
                "status": "published",
                "created_by": 1,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=6, minutes=30),
                "updated_by": 1,  # ユーザーIDを設定
                "updated_at": datetime.now(),
                "helpful_count": 5,
                "view_count": 120,
                "helpfulness_score": 4.50,
            },
            {
                "id": 2,
                "title": "ドラフトドキュメント",
                "content": "下書き状態のテストドキュメント。",
                "genre_id": 3,
                "external_link": "https://example.com",
                "status": "draft",
                "created_by": 1,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=6, minutes=30),
                "updated_by": None,
                "updated_at": None,
                "helpful_count": 0,
                "view_count": 0,
                "helpfulness_score": 0.00,
            },
            {
                "id": 3,
                "title": "アーカイブ済みドキュメント",
                "content": "これはアーカイブされたテストデータです。",
                "genre_id": 25,
                "external_link": None,
                "status": "archived",
                "created_by": 1,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=6, minutes=30),
                "updated_by": 1,  # ユーザーIDを設定
                "updated_at": datetime.now(),
                "helpful_count": 10,
                "view_count": 450,
                "helpfulness_score": 3.80,
            },
            {
                "id": 4,
                "title": "経費申請の手順まとめ",
                "content": "経費申請の流れをわかりやすくまとめたドキュメントです。",
                "genre_id": 2,
                "external_link": None,
                "status": "published",
                "created_by": 2,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=24, minutes=30),
                "updated_by": None,
                "updated_at": None,
                "helpful_count": 12,
                "view_count": 450,
                "helpfulness_score": 4.20,
            },
            {
                "id": 5,
                "title": "API開発ガイドライン",
                "content": "API開発における命名規則や設計方針をまとめています。",
                "genre_id": 9,
                "external_link": None,
                "status": "published",
                "created_by": 1,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=24, minutes=30),
                "updated_by": 1,  # ユーザーIDを設定
                "updated_at": datetime.now() - timedelta(hours=2, minutes=30),
                "helpful_count": 20,
                "view_count": 800,
                "helpfulness_score": 4.80,
            },
            {
                "id": 6,
                "title": "入退社手続きのチェックリスト",
                "content": "入社・退社時に必要な手続きを一覧化した資料です。",
                "genre_id": 17,
                "external_link": None,
                "status": "published",
                "created_by": 3,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=24, minutes=30),
                "updated_by": None,
                "updated_at": None,
                "helpful_count": 7,
                "view_count": 210,
                "helpfulness_score": 3.90,
            },
            {
                "id": 7,
                "title": "マーケティング施策の基礎",
                "content": "マーケティング施策の基本的な考え方をまとめたドキュメントです。",
                "genre_id": 22,
                "external_link": "https://example.com/marketing",
                "status": "published",
                "created_by": 3,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=24, minutes=30),
                "updated_by": 4,  # ユーザーIDを設定
                "updated_at": datetime.now() - timedelta(hours=2, minutes=30),
                "helpful_count": 15,
                "view_count": 520,
                "helpfulness_score": 4.10,
            },
            {
                "id": 8,
                "title": "ジャンルIDが重複するドキュメント",
                "content": "これはテスト用のドキュメントです。ジャンルIDは1で重複しています。",
                "genre_id": 1,
                "external_link": None,
                "status": "published",
                "created_by": 1,  # ユーザーIDを設定
                "created_at": datetime.now() - timedelta(hours=6, minutes=30),
                "updated_by": 3,  # ユーザーIDを設定
                "updated_at": datetime.now(),
                "helpful_count": 4,
                "view_count": 150,
                "helpfulness_score": 4.00,
            },
        ]

        # データ投入
        for doc_data in documents_data:
            doc = Document(**doc_data)
            db.add(doc)

        db.commit()
        print(f"✅ {len(documents_data)} 件のドキュメントデータを投入しました。")

        # 投入結果確認
        count = db.query(Document).count()
        print(f"📊 データベース内の documents 件数: {count} 件")

    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("documents テストデータを投入します...")
    init_documents()
    print("完了しました。")

