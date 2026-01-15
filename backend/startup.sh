#!/bin/bash
# Azure App Service用の起動スクリプト

# 作業ディレクトリに移動（Azure App Serviceでは/home/site/wwwrootがルート）
cd /home/site/wwwroot/backend

# Pythonのパスを設定（Azure App ServiceのPythonランタイムを使用）
export PATH="/opt/python/3.11/bin:$PATH"

# 仮想環境をアクティベート（もし存在する場合）
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 環境変数からポート番号を取得（Azure App Serviceが自動設定）
PORT=${PORT:-8000}

# FastAPIアプリケーションを起動
echo "Starting FastAPI application on port $PORT..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT

