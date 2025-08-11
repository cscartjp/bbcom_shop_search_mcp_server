#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
  InitializeRequest,
} from '@modelcontextprotocol/sdk/types.js';

// デバッグログを即座に出力
console.error('[RESPONSE] Server process started at', new Date().toISOString());
console.error('[RESPONSE] Process ID:', process.pid);
console.error('[RESPONSE] Node version:', process.version);

// サーバーインスタンスを作成
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

// 初期化ハンドラー - 正しいレスポンス形式を返す
server.setRequestHandler(InitializeRequestSchema, async (request: InitializeRequest) => {
  console.error('[RESPONSE] Initialize request received');
  console.error('[RESPONSE] Client info:', JSON.stringify(request.params.clientInfo));
  console.error('[RESPONSE] Protocol version:', request.params.protocolVersion);
  
  // MCP仕様に準拠した初期化レスポンス
  const response = {
    protocolVersion: '2025-06-18',
    capabilities: {
      tools: {}
    },
    serverInfo: {
      name: 'bbcom-miyakojima',
      version: '1.0.0'
    }
  };
  
  console.error('[RESPONSE] Sending initialize response:', JSON.stringify(response));
  return response;
});

// ツールリストハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[RESPONSE] ListTools request received');
  
  const tools = [
    {
      name: 'searchByCategory',
      description: 'カテゴリーで検索（例: レストラン、ショップ、求人）',
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: '検索カテゴリー'
          },
          limit: {
            type: 'number',
            description: '最大取得件数',
            default: 10
          }
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
          latitude: {
            type: 'number',
            description: '緯度'
          },
          longitude: {
            type: 'number',
            description: '経度'
          },
          radiusKm: {
            type: 'number',
            description: '検索半径（キロメートル）',
            default: 5
          },
          limit: {
            type: 'number',
            description: '最大取得件数',
            default: 10
          }
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
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: '検索タグのリスト'
          },
          operator: {
            type: 'string',
            enum: ['AND', 'OR'],
            description: 'タグの検索条件',
            default: 'OR'
          },
          limit: {
            type: 'number',
            description: '最大取得件数',
            default: 10
          }
        },
        required: ['tags']
      }
    },
    {
      name: 'searchByText',
      description: 'フリーテキスト検索',
      inputSchema: {
        type: 'object',
        properties: {
          searchText: {
            type: 'string',
            description: '検索テキスト'
          },
          limit: {
            type: 'number',
            description: '最大取得件数',
            default: 10
          }
        },
        required: ['searchText']
      }
    },
    {
      name: 'getItemById',
      description: '特定のアイテムを取得',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'アイテムID'
          }
        },
        required: ['id']
      }
    }
  ];
  
  console.error('[RESPONSE] Returning', tools.length, 'tools');
  return { tools };
});

// ツール実行ハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error('[RESPONSE] CallTool request:', name);
  console.error('[RESPONSE] Arguments:', JSON.stringify(args));
  
  // DATABASE_URLのチェック
  if (!process.env.DATABASE_URL) {
    const errorResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'DATABASE_URL is not configured',
            message: 'Please set DATABASE_URL in your DXT extension settings or environment variables',
            help: 'Add DATABASE_URL to the env section in Claude Desktop settings for this extension'
          }, null, 2)
        }
      ]
    };
    console.error('[RESPONSE] Returning DATABASE_URL error');
    return errorResponse;
  }
  
  // モックレスポンス（実際のデータベース接続前のテスト用）
  const mockResponse = {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          tool: name,
          arguments: args,
          status: 'success',
          message: 'Tool executed successfully (mock response)',
          data: {
            items: [],
            count: 0,
            note: 'This is a mock response. Real database connection will be implemented.'
          }
        }, null, 2)
      }
    ]
  };
  
  console.error('[RESPONSE] Returning mock response');
  return mockResponse;
});

// メイン実行関数
async function main() {
  console.error('[RESPONSE] Starting main function');
  
  try {
    // トランスポートを作成
    console.error('[RESPONSE] Creating StdioServerTransport');
    const transport = new StdioServerTransport();
    
    // エラーハンドラーを設定
    transport.onclose = () => {
      console.error('[RESPONSE] Transport closed');
    };
    
    transport.onerror = (error) => {
      console.error('[RESPONSE] Transport error:', error);
    };
    
    // サーバーに接続
    console.error('[RESPONSE] Connecting server to transport');
    await server.connect(transport);
    
    console.error('[RESPONSE] Server connected successfully, waiting for requests');
    
    // プロセスを維持
    process.stdin.resume();
    
    // シグナルハンドラー
    process.on('SIGINT', () => {
      console.error('[RESPONSE] SIGINT received, shutting down gracefully');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('[RESPONSE] SIGTERM received, shutting down gracefully');
      process.exit(0);
    });
    
    // エラーハンドラー
    process.on('uncaughtException', (error) => {
      console.error('[RESPONSE] Uncaught exception:', error);
      console.error('[RESPONSE] Stack trace:', error.stack);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[RESPONSE] Unhandled rejection at:', promise);
      console.error('[RESPONSE] Reason:', reason);
    });
    
  } catch (error) {
    console.error('[RESPONSE] Fatal error in main:', error);
    console.error('[RESPONSE] Stack trace:', (error as Error).stack);
    process.exit(1);
  }
}

// 即座に実行
console.error('[RESPONSE] Starting server immediately');
main().catch((error) => {
  console.error('[RESPONSE] Failed to start server:', error);
  process.exit(1);
});

// タイムアウト防止
setInterval(() => {
  // Keep alive - 何もしないが、プロセスを維持
}, 60000);

console.error('[RESPONSE] Script loaded, main() called');