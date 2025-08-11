#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// エラーログ出力
function logError(message: string, error?: any) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (error) {
    console.error(JSON.stringify(error, null, 2));
  }
}

// 環境変数チェック
if (!process.env.DATABASE_URL) {
  logError('DATABASE_URL is not set. Please configure it in Claude Desktop settings.');
  logError('Add the following to your DXT configuration:', {
    DATABASE_URL: 'postgresql://user:password@host:port/database?sslmode=require'
  });
  // プロセスを終了せず、エラー状態でサーバーを起動
}

// Prisma クライアントの初期化を遅延
let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma && process.env.DATABASE_URL) {
    try {
      prisma = new PrismaClient({
        log: ['error']
      });
    } catch (error) {
      logError('Failed to initialize Prisma client:', error);
    }
  }
  return prisma;
}

// Initialize MCP server
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

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'searchByCategory',
    description: 'カテゴリーで検索し、オプションで現在地からの距離でソート',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        limit: { type: 'number' }
      },
      required: ['category']
    }
  },
  {
    name: 'searchByLocation',
    description: '指定された座標から半径内のアイテムを検索',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        radiusKm: { type: 'number' },
        limit: { type: 'number' }
      },
      required: ['latitude', 'longitude']
    }
  },
  {
    name: 'searchByTags',
    description: 'タグでアイテムを検索（AND/OR条件対応）',
    inputSchema: {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
        mode: { type: 'string', enum: ['AND', 'OR'] },
        limit: { type: 'number' }
      },
      required: ['tags']
    }
  },
  {
    name: 'searchByText',
    description: 'タイトルや説明文でフリーテキスト検索',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: { type: 'string' },
        limit: { type: 'number' }
      },
      required: ['searchText']
    }
  },
  {
    name: 'getItemById',
    description: 'IDを指定してアイテムの詳細情報を取得',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  }
];

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // DATABASE_URLが設定されていない場合のエラーメッセージ
  if (!process.env.DATABASE_URL) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: DATABASE_URL is not configured. Please set it in your DXT extension settings.'
        }
      ],
      isError: true
    };
  }

  const client = getPrismaClient();
  if (!client) {
    return {
      content: [
        {
          type: 'text',
          text: 'Error: Failed to connect to database. Please check your DATABASE_URL configuration.'
        }
      ],
      isError: true
    };
  }

  try {
    // 簡単な実装例（実際のツール実装は後で追加）
    let result: any = {};
    
    switch (name) {
      case 'searchByCategory':
        // TODO: 実装
        result = { message: 'searchByCategory not yet implemented', params: args };
        break;
      case 'searchByLocation':
        // TODO: 実装
        result = { message: 'searchByLocation not yet implemented', params: args };
        break;
      case 'searchByTags':
        // TODO: 実装
        result = { message: 'searchByTags not yet implemented', params: args };
        break;
      case 'searchByText':
        // TODO: 実装
        result = { message: 'searchByText not yet implemented', params: args };
        break;
      case 'getItemById':
        // TODO: 実装
        result = { message: 'getItemById not yet implemented', params: args };
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    logError(`Tool execution error for ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// Main entry point
async function main() {
  try {
    console.error('[INFO] Starting MCP Server (Safe Mode)...');
    
    // Create transport
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    console.error('[INFO] Server connected and ready');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.error('[INFO] Received SIGINT, shutting down...');
      if (prisma) {
        await prisma.$disconnect();
      }
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.error('[INFO] Received SIGTERM, shutting down...');
      if (prisma) {
        await prisma.$disconnect();
      }
      process.exit(0);
    });
    
  } catch (error) {
    logError('Fatal error during startup:', error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  logError('Unhandled error:', error);
  process.exit(1);
});