#!/bin/bash

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"

# .envファイルを読み込む
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# MCPサーバーを起動
exec node dist/server.cjs