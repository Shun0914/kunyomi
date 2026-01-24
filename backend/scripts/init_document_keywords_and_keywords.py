"""キーワード・ドキュメントキーワード（中間テーブル）データ投入スクリプト"""
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import SessionLocal, engine, Base
from app.models import Keyword, DocumentKeyword
from datetime import datetime


def init_document_keywords():
    """キーワードおよび中間テーブルのテストデータを投入"""
    # テーブルが存在することを確認
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 既存データをチェック（キーワードと中間テーブル両方）
        k_count = db.query(Keyword).count()
        dk_count = db.query(DocumentKeyword).count()
        
        if k_count > 0 or dk_count > 0:
            print(f"既にKeyword:{k_count}件、DocumentKeyword:{dk_count}件のデータが存在します。")
            response = input("既存データを削除して再投入しますか？ (y/N): ")
            if response.lower() == 'y':
                # 子テーブル（中間テーブル）から先に削除
                db.query(DocumentKeyword).delete()
                db.query(Keyword).delete()
                db.commit()
                print("既存データを削除しました。")
            else:
                print("処理を中止しました。")
                return

        # 1. キーワードマスターデータの定義
        # normalized_nameには、検索時に比較対象となる正規化後の文字列（小文字・半角など）を格納
        keywords_data = [
            {"id": 1, "name": "AWS", "normalized_name": "aws", "usage_count": 2},
            {"id": 2, "name": "Ｐｙｔｈｏｎ", "normalized_name": "python", "usage_count": 2},
            {"id": 3, "name": "API", "normalized_name": "api", "usage_count": 1},
            {"id": 4, "name": "経費精算", "normalized_name": "けいひせいさん", "usage_count": 2},
            {"id": 5, "name": "Docker", "normalized_name": "docker", "usage_count": 0},
            {"id": 6, "name": "GitHub", "normalized_name": "github", "usage_count": 0},
        ]

        # 2. 中間テーブルデータの定義（document_id と keyword_id の紐付け）
        # documents実データのID 1, 4, 5, 6, 7, 8 を利用
        relations_data = [
            # 1つのキーワードが複数記事に紐づくケース (AWS -> ID:5, 8)
            {"document_id": 5, "keyword_id": 1},
            {"document_id": 8, "keyword_id": 1},
            # 1つの記事に複数キーワードが紐づくケース (ID:5 -> AWS, API, Python)
            {"document_id": 5, "keyword_id": 3},
            {"document_id": 5, "keyword_id": 2},
            # 表記ゆれ・正規化の検証用紐付け
            {"document_id": 1, "keyword_id": 2}, # Python
            {"document_id": 4, "keyword_id": 4}, # 経費精算
            {"document_id": 6, "keyword_id": 4}, # 経費精算（別記事にも紐付け）
        ]

        # キーワード投入
        for k in keywords_data:
            keyword = Keyword(
                id=k["id"],
                name=k["name"],
                normalized_name=k["normalized_name"],
                usage_count=k["usage_count"],
                created_at=datetime.now()
            )
            db.add(keyword)
        
        # 中間テーブル投入
        for rel in relations_data:
            doc_keyword = DocumentKeyword(
                document_id=rel["document_id"],
                keyword_id=rel["keyword_id"],
                created_at=datetime.now()
            )
            db.add(doc_keyword)

        db.commit()
        print(f"✅ Keyword:{len(keywords_data)}件、DocumentKeyword:{len(relations_data)}件を投入しました。")

    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("キーワード関連のテストデータを投入します...")
    init_document_keywords()
    print("完了しました。")