#!/usr/bin/env node

// 最小限のMCPサーバー実装（デバッグ用）

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 即座にログ出力
console.error('[MINIMAL] Server starting at', new Date().toISOString());
console.error('[MINIMAL] Process info:', {
  pid: process.pid,
  cwd: process.cwd(),
  argv: process.argv,
  env_keys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('MCP')),
});

// MCPサーバーを初期化
const server = new Server(
  {
    name: 'bbcom-miyakojima-minimal',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

console.error('[MINIMAL] Server instance created');

// ツールリストのハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[MINIMAL] ListTools request received');
  return {
    tools: [
      {
        name: 'test',
        description: 'Test tool that always works',
        inputSchema: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    ]
  };
});

// ツール実行のハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error('[MINIMAL] CallTool request received:', request.params.name);
  return {
    content: [
      {
        type: 'text',
        text: `Test response: ${JSON.stringify(request.params.arguments)}`
      }
    ]
  };
});

// メイン処理
async function main() {
  try {
    console.error('[MINIMAL] Main function started');
    
    const transport = new StdioServerTransport();
    console.error('[MINIMAL] Transport created');
    
    await server.connect(transport);
    console.error('[MINIMAL] Server connected to transport');
    
    // エラーハンドリング
    process.on('uncaughtException', (error) => {
      console.error('[MINIMAL] Uncaught exception:', error);
    });
    
    process.on('unhandledRejection', (error) => {
      console.error('[MINIMAL] Unhandled rejection:', error);
    });
    
    // シグナルハンドリング
    process.on('SIGINT', () => {
      console.error('[MINIMAL] SIGINT received');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('[MINIMAL] SIGTERM received');
      process.exit(0);
    });
    
    // 定期的な生存確認
    setInterval(() => {
      console.error('[MINIMAL] Still alive at', new Date().toISOString());
    }, 5000);
    
  } catch (error) {
    console.error('[MINIMAL] Fatal error in main:', error);
    process.exit(1);
  }
}

// 実行
console.error('[MINIMAL] About to call main()');
main().catch((error) => {
  console.error('[MINIMAL] Main failed:', error);
  process.exit(1);
});