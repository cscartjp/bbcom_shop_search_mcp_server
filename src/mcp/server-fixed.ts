#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// 即座にログを出力して動作確認
console.error('[FIXED] Starting server at', new Date().toISOString());

// サーバーを作成
const server = new Server(
  {
    name: 'bbcom-miyakojima',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// 初期化リクエストのハンドラー（重要！）
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('[FIXED] Initialize request received:', JSON.stringify(request.params));
  return {
    protocolVersion: '2025-06-18',
    capabilities: {
      tools: {}
    },
    serverInfo: {
      name: 'bbcom-miyakojima',
      version: '1.0.0'
    }
  };
});

// ツールリストのハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[FIXED] ListTools request received');
  return {
    tools: [
      {
        name: 'searchByCategory',
        description: 'カテゴリーで検索',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string' }
          },
          required: ['category']
        }
      },
      {
        name: 'searchByLocation',
        description: '位置情報で検索',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            radiusKm: { type: 'number' }
          },
          required: ['latitude', 'longitude']
        }
      },
      {
        name: 'searchByTags',
        description: 'タグで検索',
        inputSchema: {
          type: 'object',
          properties: {
            tags: { type: 'array', items: { type: 'string' } }
          },
          required: ['tags']
        }
      },
      {
        name: 'searchByText',
        description: 'テキスト検索',
        inputSchema: {
          type: 'object',
          properties: {
            searchText: { type: 'string' }
          },
          required: ['searchText']
        }
      },
      {
        name: 'getItemById',
        description: 'ID指定で取得',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        }
      }
    ]
  };
});

// ツール実行のハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error('[FIXED] CallTool request:', request.params.name);
  
  const { name, arguments: args } = request.params;
  
  // DATABASE_URLが未設定の場合のエラーメッセージ
  if (!process.env.DATABASE_URL) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'DATABASE_URL is not configured',
            message: 'Please set DATABASE_URL in your DXT extension settings',
            tool: name,
            arguments: args
          }, null, 2)
        }
      ]
    };
  }
  
  // 簡易的な応答（実際のデータベース接続はなし）
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          message: `Tool ${name} called successfully`,
          arguments: args,
          result: 'This is a test response. Database connection not implemented yet.'
        }, null, 2)
      }
    ]
  };
});

// メイン関数
async function main() {
  try {
    console.error('[FIXED] Creating transport...');
    const transport = new StdioServerTransport();
    
    console.error('[FIXED] Connecting server to transport...');
    await server.connect(transport);
    
    console.error('[FIXED] Server is now running and ready for requests');
    
    // プロセスが終了しないように保持
    process.stdin.resume();
    
    // グレースフルシャットダウン
    process.on('SIGINT', () => {
      console.error('[FIXED] SIGINT received, shutting down...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('[FIXED] SIGTERM received, shutting down...');
      process.exit(0);
    });
    
    // エラーハンドリング
    process.on('uncaughtException', (error) => {
      console.error('[FIXED] Uncaught exception:', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[FIXED] Unhandled rejection at:', promise, 'reason:', reason);
    });
    
  } catch (error) {
    console.error('[FIXED] Fatal error:', error);
    process.exit(1);
  }
}

// サーバーを起動
console.error('[FIXED] Calling main()...');
main().catch((error) => {
  console.error('[FIXED] Main function error:', error);
  process.exit(1);
});