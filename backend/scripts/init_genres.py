"""ジャンルマスターデータ投入スクリプト"""
import sys
import os

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db import SessionLocal, engine, Base
from app.models import Genre
from datetime import datetime

# 非対話モードのフラグ（環境変数から取得、またはコマンドライン引数から）
FORCE_REINIT = os.getenv("FORCE_REINIT", "false").lower() == "true"


def init_genres():
    """ジャンルマスターデータを投入"""
    # テーブルが存在することを確認
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 既存データをチェック
        existing_count = db.query(Genre).count()
        if existing_count > 0:
            print(f"既に{existing_count}件のジャンルデータが存在します。")
            if FORCE_REINIT:
                print("FORCE_REINIT=trueのため、既存データを削除して再投入します。")
                # 外部キー制約があるため、レベル3 → レベル2 → レベル1の順で削除
                db.query(Genre).filter(Genre.level == 3).delete()
                db.query(Genre).filter(Genre.level == 2).delete()
                db.query(Genre).filter(Genre.level == 1).delete()
                db.commit()
                print("既存データを削除しました。")
            else:
                try:
                    response = input("既存データを削除して再投入しますか？ (y/N): ")
                    if response.lower() == 'y':
                        db.query(Genre).delete()
                        db.commit()
                        print("既存データを削除しました。")
                    else:
                        print("処理を中止しました。")
                        return
                except EOFError:
                    print("非対話モードのため、既存データを保持します。")
                    print("既存データを削除する場合は、環境変数 FORCE_REINIT=true を設定して実行してください。")
                    print("例: FORCE_REINIT=true python scripts/init_genres.py")
                    return
        
        # ジャンルデータを定義（docs/genre_master_data.mdに基づく）
        genres_data = [
            # L1: 申請系
            {"id": 1, "name": "申請系", "parent_id": None, "level": 1, "path": "1", "display_order": 1},
            # L2: 経費申請
            {"id": 2, "name": "経費申請", "parent_id": 1, "level": 2, "path": "1/2", "display_order": 1},
            # L3: 交通費
            {"id": 3, "name": "交通費", "parent_id": 2, "level": 3, "path": "1/2/3", "display_order": 1},
            # L3: 会議費
            {"id": 4, "name": "会議費", "parent_id": 2, "level": 3, "path": "1/2/4", "display_order": 2},
            # L3: その他経費
            {"id": 5, "name": "その他経費", "parent_id": 2, "level": 3, "path": "1/2/5", "display_order": 3},
            # L2: 休暇申請
            {"id": 6, "name": "休暇申請", "parent_id": 1, "level": 2, "path": "1/6", "display_order": 2},
            # L3: 有給休暇
            {"id": 27, "name": "有給休暇", "parent_id": 6, "level": 3, "path": "1/6/27", "display_order": 1},
            # L3: 夏季休暇
            {"id": 28, "name": "夏季休暇", "parent_id": 6, "level": 3, "path": "1/6/28", "display_order": 2},
            # L3: 慶弔休暇
            {"id": 29, "name": "慶弔休暇", "parent_id": 6, "level": 3, "path": "1/6/29", "display_order": 3},
            # L2: その他申請
            {"id": 7, "name": "その他申請", "parent_id": 1, "level": 2, "path": "1/7", "display_order": 3},
            
            # L1: 開発系
            {"id": 8, "name": "開発系", "parent_id": None, "level": 1, "path": "8", "display_order": 2},
            # L2: API開発
            {"id": 9, "name": "API開発", "parent_id": 8, "level": 2, "path": "8/9", "display_order": 1},
            # L3: REST API
            {"id": 30, "name": "REST API", "parent_id": 9, "level": 3, "path": "8/9/30", "display_order": 1},
            # L3: GraphQL API
            {"id": 31, "name": "GraphQL API", "parent_id": 9, "level": 3, "path": "8/9/31", "display_order": 2},
            # L3: Webhook
            {"id": 32, "name": "Webhook", "parent_id": 9, "level": 3, "path": "8/9/32", "display_order": 3},
            # L2: データベース設計
            {"id": 10, "name": "データベース設計", "parent_id": 8, "level": 2, "path": "8/10", "display_order": 2},
            # L3: ER図設計
            {"id": 33, "name": "ER図設計", "parent_id": 10, "level": 3, "path": "8/10/33", "display_order": 1},
            # L3: テーブル設計
            {"id": 34, "name": "テーブル設計", "parent_id": 10, "level": 3, "path": "8/10/34", "display_order": 2},
            # L3: マイグレーション
            {"id": 35, "name": "マイグレーション", "parent_id": 10, "level": 3, "path": "8/10/35", "display_order": 3},
            # L2: フロントエンド開発
            {"id": 11, "name": "フロントエンド開発", "parent_id": 8, "level": 2, "path": "8/11", "display_order": 3},
            # L3: React開発
            {"id": 36, "name": "React開発", "parent_id": 11, "level": 3, "path": "8/11/36", "display_order": 1},
            # L3: Next.js開発
            {"id": 37, "name": "Next.js開発", "parent_id": 11, "level": 3, "path": "8/11/37", "display_order": 2},
            # L3: コンポーネント設計
            {"id": 38, "name": "コンポーネント設計", "parent_id": 11, "level": 3, "path": "8/11/38", "display_order": 3},
            # L2: デプロイ・運用
            {"id": 12, "name": "デプロイ・運用", "parent_id": 8, "level": 2, "path": "8/12", "display_order": 4},
            # L3: Azureデプロイ
            {"id": 39, "name": "Azureデプロイ", "parent_id": 12, "level": 3, "path": "8/12/39", "display_order": 1},
            # L3: CI/CD
            {"id": 40, "name": "CI/CD", "parent_id": 12, "level": 3, "path": "8/12/40", "display_order": 2},
            # L3: 監視・ログ
            {"id": 41, "name": "監視・ログ", "parent_id": 12, "level": 3, "path": "8/12/41", "display_order": 3},
            # L2: テスト
            {"id": 13, "name": "テスト", "parent_id": 8, "level": 2, "path": "8/13", "display_order": 5},
            # L3: 単体テスト
            {"id": 42, "name": "単体テスト", "parent_id": 13, "level": 3, "path": "8/13/42", "display_order": 1},
            # L3: 結合テスト
            {"id": 43, "name": "結合テスト", "parent_id": 13, "level": 3, "path": "8/13/43", "display_order": 2},
            # L3: E2Eテスト
            {"id": 44, "name": "E2Eテスト", "parent_id": 13, "level": 3, "path": "8/13/44", "display_order": 3},
            # L2: コードレビュー
            {"id": 14, "name": "コードレビュー", "parent_id": 8, "level": 2, "path": "8/14", "display_order": 6},
            # L3: PRレビュー
            {"id": 45, "name": "PRレビュー", "parent_id": 14, "level": 3, "path": "8/14/45", "display_order": 1},
            # L3: ペアレビュー
            {"id": 46, "name": "ペアレビュー", "parent_id": 14, "level": 3, "path": "8/14/46", "display_order": 2},
            # L3: テクニカルレビュー
            {"id": 47, "name": "テクニカルレビュー", "parent_id": 14, "level": 3, "path": "8/14/47", "display_order": 3},
            # L2: その他
            {"id": 15, "name": "その他", "parent_id": 8, "level": 2, "path": "8/15", "display_order": 7},
            
            # L1: 総務・人事系
            {"id": 16, "name": "総務・人事系", "parent_id": None, "level": 1, "path": "16", "display_order": 3},
            # L2: 入退社手続き
            {"id": 17, "name": "入退社手続き", "parent_id": 16, "level": 2, "path": "16/17", "display_order": 1},
            # L2: 福利厚生
            {"id": 18, "name": "福利厚生", "parent_id": 16, "level": 2, "path": "16/18", "display_order": 2},
            # L2: その他
            {"id": 19, "name": "その他", "parent_id": 16, "level": 2, "path": "16/19", "display_order": 3},
            
            # L1: 営業・マーケティング系
            {"id": 20, "name": "営業・マーケティング系", "parent_id": None, "level": 1, "path": "20", "display_order": 4},
            # L2: 営業プロセス
            {"id": 21, "name": "営業プロセス", "parent_id": 20, "level": 2, "path": "20/21", "display_order": 1},
            # L2: マーケティング施策
            {"id": 22, "name": "マーケティング施策", "parent_id": 20, "level": 2, "path": "20/22", "display_order": 2},
            
            # L1: 財務・経理系
            {"id": 23, "name": "財務・経理系", "parent_id": None, "level": 1, "path": "23", "display_order": 5},
            # L2: 会計処理
            {"id": 24, "name": "会計処理", "parent_id": 23, "level": 2, "path": "23/24", "display_order": 1},
            # L2: 予算管理
            {"id": 25, "name": "予算管理", "parent_id": 23, "level": 2, "path": "23/25", "display_order": 2},
            
            # L1: その他
            {"id": 26, "name": "その他", "parent_id": None, "level": 1, "path": "26", "display_order": 6},
        ]
        
        # データを投入
        for genre_data in genres_data:
            genre = Genre(
                id=genre_data["id"],
                name=genre_data["name"],
                parent_id=genre_data["parent_id"],
                level=genre_data["level"],
                path=genre_data["path"],
                display_order=genre_data["display_order"],
                is_active=True,
                created_at=datetime.now()
            )
            db.add(genre)
        
        db.commit()
        print(f"✅ {len(genres_data)}件のジャンルデータを投入しました。")
        
        # 投入結果を確認
        count = db.query(Genre).count()
        print(f"📊 データベース内のジャンル数: {count}件")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("ジャンルマスターデータを投入します...")
    init_genres()
    print("完了しました。")

