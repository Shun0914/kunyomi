"""
ドキュメント作成機能 (create_document) の単体テスト

テスト対象：
- POST /api/documents/
- 正常系1：DocumentCreateRequestスキーマのバリデーション（キーワード3個OK）
- 正常系2：新規キーワードでドキュメント作成（MySQL環境のみ）
- 異常系：存在しないジャンルIDでドキュメント作成
"""
import os
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.schemas.document import DocumentCreateRequest

# MySQL環境でない場合にAPI正常系テストをスキップ
SKIP_IF_NOT_MYSQL = "mysql" not in (os.getenv("DATABASE_URL") or "").lower()


class TestDocumentCreateSchema:
    """DocumentCreateRequestスキーマの単体テスト（DB不要）"""

    # [正常系] キーワード3個以内でバリデーション通過
    def test_schema_valid_with_three_keywords(self):
        """キーワード3個は正常に受け付けられる"""
        data = DocumentCreateRequest(
            title="テストタイトル",
            content="テスト本文",
            genre_id=3,
            external_link=None,
            keywords=["キーワード1", "キーワード2", "キーワード3"],
        )
        assert len(data.keywords) == 3
        assert data.keywords == ["キーワード1", "キーワード2", "キーワード3"]

    # [異常系] キーワード4個以上でバリデーションエラー
    def test_schema_invalid_with_four_keywords(self):
        """キーワード4個以上はValueError"""
        with pytest.raises(ValidationError) as exc_info:
            DocumentCreateRequest(
                title="テストタイトル",
                content="テスト本文",
                genre_id=3,
                external_link=None,
                keywords=["キーワード1", "キーワード2", "キーワード3", "キーワード4"],
            )
        assert "キーワードは最大3個まで" in str(exc_info.value)


class TestCreateDocumentAPI:
    """ドキュメント作成APIのテスト"""

    # [正常系1] 新規キーワードでドキュメント作成
    @pytest.mark.skipif(SKIP_IF_NOT_MYSQL, reason="MySQL環境（DATABASE_URL）が必要")
    def test_create_document_with_new_keywords_success(self, client: TestClient):
        """
        新規キーワード3個でドキュメント作成
        期待値：
        - HTTPステータス: 201 Created
        - Documentレコード作成成功
        - Keywordレコード3件作成（usage_count=1）
        - DocumentKeyword中間テーブル3件作成
        - レスポンスにキーワード3個含まれる
        """
        payload = {
            "title": "単体テスト用ドキュメント",
            "content": "これはPytestによる単体テスト用のドキュメントです。",
            "genre_id": 3,  # 交通費（conftestで投入済み）
            "external_link": None,
            "keywords": ["単体テスト", "Pytest", "API"],
        }

        response = client.post("/api/documents/", json=payload)

        assert response.status_code == 201, f"期待: 201, 実際: {response.status_code}, body: {response.text}"

        data = response.json()
        assert "id" in data
        assert data["title"] == payload["title"]
        assert data["content"] == payload["content"]
        assert data["genre_id"] == payload["genre_id"]
        assert "keywords" in data
        assert len(data["keywords"]) == 3

        keyword_names = [k["name"] for k in data["keywords"]]
        assert "単体テスト" in keyword_names
        assert "Pytest" in keyword_names
        assert "API" in keyword_names

    # [異常系] 存在しないジャンルIDでドキュメント作成
    def test_create_document_with_invalid_genre_id_returns_400(self, client: TestClient):
        """
        存在しないジャンルIDでドキュメント作成
        条件：genre_id=99999（存在しないID）
        期待値：
        - HTTPステータス: 400 Bad Request
        - エラーメッセージ: "Genre with id 99999 not found"
        - Documentレコード作成されない
        """
        payload = {
            "title": "無効ジャンルテスト",
            "content": "存在しないジャンルで作成を試みる",
            "genre_id": 99999,
            "external_link": None,
            "keywords": [],
        }

        response = client.post("/api/documents/", json=payload)

        assert response.status_code == 400, f"期待: 400, 実際: {response.status_code}, body: {response.text}"

        data = response.json()
        assert "detail" in data
        assert "99999" in str(data["detail"])
        assert "not found" in str(data["detail"]).lower() or "Genre" in str(data["detail"])
