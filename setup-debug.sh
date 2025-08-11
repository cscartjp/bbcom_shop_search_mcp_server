#!/bin/bash

echo "Claude Desktop デバッグ環境のセットアップ"
echo "========================================="

# Developer settings ファイルの作成
DEVELOPER_SETTINGS_PATH="$HOME/Library/Application Support/Claude/developer_settings.json"

echo "1. Developer Settings を作成中..."
mkdir -p "$(dirname "$DEVELOPER_SETTINGS_PATH")"

cat > "$DEVELOPER_SETTINGS_PATH" << 'EOF'
{
  "allowDevTools": true
}
EOF

echo "   ✅ Developer Settings を作成しました"
echo "   場所: $DEVELOPER_SETTINGS_PATH"

echo ""
echo "2. デバッグ方法:"
echo "   - Claude Desktopを再起動"
echo "   - Command+Option+Shift+i で開発者ツールを開く"

echo ""
echo "3. ログファイルの場所:"
echo "   ~/Library/Logs/Claude/mcp*.log"

echo ""
echo "4. ログの監視コマンド:"
echo "   tail -F ~/Library/Logs/Claude/mcp-server-bbcom*.log"

echo ""
echo "5. MCP Inspector でのテスト:"
echo "   npm run inspect"
echo "   ブラウザで http://localhost:5173 を開く"

echo ""
echo "========================================="
echo "セットアップ完了！"