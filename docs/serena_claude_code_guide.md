# Serena MCP × Claude Code 活用ガイド

このドキュメントでは、Serena MCP を Claude Code で使い始める際の **最初のステップ** と **継続的な活用方法** をまとめています。

https://zenn.dev/sc30gsw/articles/ff81891959aaef

3. プロジェクトをアクティブ化
   ```bash
   # CLI ショートカット
   claude mcp activate "$(pwd)"
   # もしくは MCP ツールを使って明示的に実行
   claude mcp run serena \
     --tool activate_project \
     --context default \
     --prompt "Activate project at $(pwd)"
   ```
4. プロバイダー一覧を確認
   ```bash
   claude mcp list
   ```
   - `serena` が表示されれば成功。

---

## 1. 前提条件

- **Serena MCP サーバー** が起動していること（例: `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`）。
- **Claude Code** がインストール済みであること。
- プロジェクトディレクトリが Git 管理されていること。

---

## 2. プロジェクトのアクティベート

1. ターミナルで対象プロジェクトに移動
   ```bash
   cd /path/to/your/claude-code-project
   ```
2. MCP サーバーとして Serena を追加（初回のみ）
   ```bash
   claude mcp add serena \
     -- http://localhost:19006 \
     --context ide-assistant \
     --project "$(pwd)"
   ```
3. プロジェクトをアクティブ化
   ```bash
   claude mcp activate "$(pwd)"
   # または登録済みプロジェクト名で
   # claude mcp activate your-project-name
   ```
4. プロバイダー一覧を確認
   ```bash
   claude mcp list
   ```
   - `serena` が表示されれば成功。

---

## 3. プロジェクト初期化

プロジェクトを Serena が認識できる状態に初期化します。以下のコマンドで、プロジェクト固有の設定ファイルを生成しましょう。

```bash
claude mcp run serena \
  --tool project_init \
  --context default \
  --prompt "Initialize the project configuration for Serena"
```

実行後、プロジェクトルートに `.serena/project.yml` が作成されます。生成されたファイルをレビューし、必要に応じてカスタマイズしてください。

---

## 4. オンボーディングの実行

プロジェクトの全体構造を Serena に記憶させます。

```bash
claude mcp run serena \
  --tool onboarding \
  --context default \
  --prompt "プロジェクトのオンボーディングを実行し、構造と主要ファイルを解析してください"
```

- 実行後、`.serena/memories/` 配下に記録が生成されます。

---

## 4. 全体像の把握

### 4.1 ファイルツリー

```bash
claude mcp run serena \
  --tool file_browser \
  --context default \
  --prompt "プロジェクトルートのディレクトリツリーを深さ2までリストしてください"
```

### 4.2 シンボル一覧

```bash
claude mcp run serena \
  --tool symbol_extractor \
  --context default \
  --prompt "src/ フォルダ内のトップレベルシンボルを一覧表示してください"
```

### 4.3 ドキュメント要約

```bash
claude mcp run serena \
  --tool code_analyzer \
  --context default \
  --prompt "README.md の内容を 5 行程度で要約してください"
```

---

## 5. 日常的な活用パターン

1. **小さなタスク依頼**\
   例: バグ修正やリファクタリング

   ```bash
   claude mcp run serena \
     --tool code_editor \
     --prompt "utils/math.py の add 関数に入力チェックを追加してください"
   ```

2. **テスト作成 & 自動化**\
   例: pytest テストケース生成

   ```bash
   claude mcp run serena \
     --tool code_editor \
     --prompt "feature_x.py のユニットテストを 3 ケース作成してください"
   ```

3. **定期的なリファクタ提案**

   ```bash
   claude mcp run serena \
     --tool planning \
     --prompt "直近のコミット履歴を分析し、改善ポイントを提案してください"
   ```

4. **ドキュメント整備**\
   例: API リファレンス生成

   ```bash
   claude mcp run serena \
     --tool doc_generator \
     --prompt "主要クラスの API リファレンスを markdown 形式で生成してください"
   ```

---

## 5.1 Serena スラッシュコマンド サンプル

Claude Code のカスタムスラッシュコマンド `/serena` を利用した例を紹介します。

### Basic Usage

```bash
# シンプルな問題解決
/serena "fix login bug"

# クイックな機能実装
/serena "add search filter" -q

# コード最適化
/serena "improve load time" -c
```

### Advanced Usage

```bash
# 複雑なシステム設計（リサーチ付き）
/serena "design microservices architecture" -d -r -v

# 完全な機能開発（TODO生成付き）
/serena "implement user dashboard with charts" -s -t -c

# ドキュメント重視の深い分析
/serena "migrate to new framework" -d -r -v --focus=frontend
```

---

## 6. フィードバックループ

1. Serena の変更提案 → 自ローカルで **レビュー & テスト**
2. 差分やエラーを **コメント** として Serena に返却
3. 次回以降の応答精度向上に役立てる

---

## 7. コンテキスト管理

- **default**: 一般的な操作向け
- **ide-assistant**: IDE 連携時の対話向け
- **planning**, **editing** など、用途に合わせて切り替え

---

## 8. メモリとガイドラインの活用

- **initial_instructions** にコーディング規約や設計原則を追加
- `.serena/memories/` に記録された要点を適宜参照

---

## 9. 定期的な振り返りタスク

```bash
claude mcp run serena \
  --tool planning \
  --prompt "1 週間の開発履歴をまとめ、次の優先タスクを提案してください"
```

---

以上が **Serena MCP を Claude Code で使う際の初期ステップ** と **活用方法** のまとめです。ぜひこのフローを参考に、開発効率と品質向上に役立ててください！
