# Azure App Service 起動コマンド設定手順

このドキュメントでは、Azure App ServiceでFastAPIアプリケーションを起動するための設定手順を説明します。

---

## 前提条件

- Azure App Serviceリソースが既に作成されていること
- バックエンドのコードが`backend/`ディレクトリに配置されていること
- `requirements.txt`が`backend/`ディレクトリに存在すること

---

## 起動方法の選択肢

### 方法1: Azure Portalで起動コマンドを設定（推奨）

Azure Portalで直接起動コマンドを設定する方法です。最も簡単で確実です。

#### 手順

1. [Azure Portal](https://portal.azure.com/) にログイン
2. App Serviceリソース（`tech0-gen-11-step3-2-py-54`）を開く
3. 左側メニューで **「設定」→「構成」** を選択
4. **「一般設定」** タブを選択
5. **「起動コマンド」** フィールドに以下を入力：

```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

6. **「保存」** をクリック
7. App Serviceが再起動されます（数分かかります）

**重要なポイント**:
- `${PORT:-8000}` は、環境変数 `PORT` が設定されている場合はその値を使用し、なければ `8000` を使用します
- Azure App Serviceは自動的に `PORT` 環境変数を設定するため、この変数を使用することで適切なポートで起動できます
- `0.0.0.0` を指定することで、すべてのネットワークインターフェースからアクセス可能になります

---

### 方法2: 設定ファイル（startup.sh）を使用

プロジェクトに `startup.sh` ファイルを作成して、GitHubからデプロイする方法です。

#### 手順

1. `backend/startup.sh` ファイルが既に作成されていることを確認
2. Azure PortalでApp Serviceを開く
3. **「設定」→「構成」→「一般設定」** を選択
4. **「起動コマンド」** フィールドに以下を入力：

```bash
/home/site/wwwroot/backend/startup.sh
```

5. **「保存」** をクリック

---

## 作業ディレクトリの設定

### GitHubからデプロイした場合

Azure App Serviceは、リポジトリのルートディレクトリを `/home/site/wwwroot` にデプロイします。

つまり：
- リポジトリのルート: `/home/site/wwwroot`
- `backend/` ディレクトリ: `/home/site/wwwroot/backend`

### 起動コマンドでの移動

起動コマンドで `cd backend` を実行することで、作業ディレクトリを `backend/` に移動します。

---

## 環境変数の確認

### 必要な環境変数

Azure Portalで以下の環境変数が設定されていることを確認してください：

1. **`DATABASE_URL`**: データベース接続文字列
   ```
   mysql+pymysql://{username}:{password}@{host}.mysql.database.azure.com:3306/{database_name}
   ```
   **注意**: `{username}`, `{password}`, `{host}`, `{database_name}` を実際の値に置き換えてください。

2. **`ALLOWED_ORIGINS`**: CORSで許可するオリジン（フロントエンドApp ServiceのURL）
   ```
   https://tech0-gen-11-step3-2-node-54.azurewebsites.net
   ```

### 環境変数の確認方法

1. Azure PortalでApp Serviceを開く
2. **「設定」→「構成」→「アプリケーション設定」** を選択
3. 環境変数が一覧表示されます

---

## 動作確認

### 1. ログの確認

1. Azure PortalでApp Serviceを開く
2. **「監視」→「ログストリーム」** を選択
3. ログストリームで起動ログを確認

**成功時のログ例**:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 2. ヘルスチェック

App ServiceのURLにアクセスして、APIが動作しているか確認：

```
https://tech0-gen-11-step3-2-py-54.azurewebsites.net/
```

**期待されるレスポンス**:
```json
{
  "message": "API is running",
  "status": "ok"
}
```

### 3. データベース接続確認

```
https://tech0-gen-11-step3-2-py-54.azurewebsites.net/health/db
```

**期待されるレスポンス**:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## トラブルシューティング

### エラー: `ModuleNotFoundError: No module named 'app'`

**原因**: 作業ディレクトリが正しく設定されていない

**解決方法**:
- 起動コマンドで `cd backend` を実行しているか確認
- または、起動コマンドを `cd /home/site/wwwroot/backend && uvicorn app.main:app ...` に変更

### エラー: `Connection refused` または `Can't connect to MySQL server`

**原因**: データベース接続設定が間違っている、またはファイアウォールルールが設定されていない

**解決方法**:
- `DATABASE_URL` 環境変数が正しく設定されているか確認
- Azure Database for MySQLのファイアウォールルールでApp ServiceのアウトバウンドIPアドレスが許可されているか確認

### エラー: `CORS` エラー

**原因**: `ALLOWED_ORIGINS` 環境変数が設定されていない、またはフロントエンドURLが含まれていない

**解決方法**:
- `ALLOWED_ORIGINS` 環境変数にフロントエンドApp ServiceのURLを設定

### アプリケーションが起動しない

**原因**: 起動コマンドが間違っている、または依存関係がインストールされていない

**解決方法**:
1. ログストリームでエラーメッセージを確認
2. `requirements.txt` が `backend/` ディレクトリに存在するか確認
3. 起動コマンドが正しいか再確認

---

## 参考リンク

- [Azure App Service Python 起動コマンド](https://learn.microsoft.com/ja-jp/azure/app-service/configure-language-python#configure-a-startup-file)
- [FastAPI デプロイガイド](https://fastapi.tiangolo.com/deployment/)

