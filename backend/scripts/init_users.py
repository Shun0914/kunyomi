import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

"""users テーブルに初期データを挿入するスクリプト"""
from app.db import SessionLocal, Base, engine
from app.models.user import User  # Userモデルをインポート
from datetime import datetime

def init_users():
    """users テーブルに初期データを挿入"""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 初期データ
        users_data = [
            {"id": 1, "name": "山田太郎", "email": "yamada@example.com", "created_at": datetime.now()},
            {"id": 2, "name": "佐藤花子", "email": "sato@example.com", "created_at": datetime.now()},
            {"id": 3, "name": "鈴木一郎", "email": "suzuki@example.com", "created_at": datetime.now()},
            {"id": 4, "name": "田中次郎", "email": "tanaka@example.com", "created_at": datetime.now()},
        ]

        # データ挿入
        for user_data in users_data:
            user = User(**user_data)
            db.add(user)

        db.commit()
        print(f"✅ {len(users_data)} 件のユーザーデータを挿入しました。")

    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("users テーブルに初期データを挿入します...")
    init_users()
    print("完了しました。")