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
import dotenv from 'dotenv';

import {
  searchByCategorySchema,
  searchByLocationSchema,
  searchByTagsSchema,
  searchByTextSchema,
  getItemByIdSchema
} from './schemas/index.js';

import { searchByCategory } from './tools/search-by-category.js';
import { searchByLocation } from './tools/search-by-location.js';
import { searchByTags } from './tools/search-by-tags.js';
import { searchByText } from './tools/search-by-text.js';
import { getItemById } from './tools/get-item-by-id.js';

// Load environment variables
dotenv.config();

// Debug logging function
function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (data) {
    console.error(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.error(logMessage);
  }
}

debugLog('Starting MCP Server with debug logging enabled');
debugLog('Environment:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
  NODE_ENV: process.env.NODE_ENV,
  MCP_SERVER_NAME: process.env.MCP_SERVER_NAME || 'bbcom-miyakojima',
  MCP_SERVER_VERSION: process.env.MCP_SERVER_VERSION || '1.0.0'
});

// Initialize Prisma client with logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' }
  ]
});

// Log Prisma events
prisma.$on('query', (e) => {
  debugLog('Prisma Query:', {
    query: e.query,
    params: e.params,
    duration: e.duration
  });
});

prisma.$on('error', (e) => {
  debugLog('Prisma Error:', e);
});

// Test database connection
async function testConnection() {
  try {
    debugLog('Testing database connection...');
    await prisma.$connect();
    const count = await prisma.citadelaItem.count();
    debugLog('Database connected successfully', { itemCount: count });
  } catch (error) {
    debugLog('Database connection failed:', error);
    throw error;
  }
}

// Initialize MCP server
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'bbcom-miyakojima',
    version: process.env.MCP_SERVER_VERSION || '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

debugLog('Server initialized with capabilities:', server.serverInfo);

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'searchByCategory',
    description: 'カテゴリーで検索し、オプションで現在地からの距離でソート',
    inputSchema: searchByCategorySchema
  },
  {
    name: 'searchByLocation',
    description: '指定された座標から半径内のアイテムを検索',
    inputSchema: searchByLocationSchema
  },
  {
    name: 'searchByTags',
    description: 'タグでアイテムを検索（AND/OR条件対応）',
    inputSchema: searchByTagsSchema
  },
  {
    name: 'searchByText',
    description: 'タイトルや説明文でフリーテキスト検索',
    inputSchema: searchByTextSchema
  },
  {
    name: 'getItemById',
    description: 'IDを指定してアイテムの詳細情報を取得',
    inputSchema: getItemByIdSchema
  }
];

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  debugLog('ListTools request received');
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  debugLog('CallTool request received:', {
    toolName: request.params.name,
    arguments: request.params.arguments
  });

  try {
    const { name, arguments: args } = request.params;
    
    let result;
    const startTime = Date.now();

    switch (name) {
      case 'searchByCategory':
        const categoryParams = searchByCategorySchema.parse(args);
        debugLog('Executing searchByCategory with params:', categoryParams);
        result = await searchByCategory(prisma, categoryParams);
        break;

      case 'searchByLocation':
        const locationParams = searchByLocationSchema.parse(args);
        debugLog('Executing searchByLocation with params:', locationParams);
        result = await searchByLocation(prisma, locationParams);
        break;

      case 'searchByTags':
        const tagsParams = searchByTagsSchema.parse(args);
        debugLog('Executing searchByTags with params:', tagsParams);
        result = await searchByTags(prisma, tagsParams);
        break;

      case 'searchByText':
        const textParams = searchByTextSchema.parse(args);
        debugLog('Executing searchByText with params:', textParams);
        result = await searchByText(prisma, textParams);
        break;

      case 'getItemById':
        const idParams = getItemByIdSchema.parse(args);
        debugLog('Executing getItemById with params:', idParams);
        result = await getItemById(prisma, idParams);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    const duration = Date.now() - startTime;
    debugLog(`Tool ${name} executed successfully`, {
      duration: `${duration}ms`,
      resultCount: Array.isArray(result) ? result.length : 1
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    debugLog('Tool execution error:', {
      toolName: request.params.name,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Validation error: ${JSON.stringify(error.errors, null, 2)}`
          }
        ],
        isError: true
      };
    }
    
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
  debugLog('Starting main function');
  
  try {
    // Test database connection first
    await testConnection();
    
    // Create transport
    const transport = new StdioServerTransport();
    debugLog('StdioServerTransport created');
    
    // Connect server to transport
    await server.connect(transport);
    debugLog('Server connected to transport, ready to receive requests');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      debugLog('Received SIGINT, shutting down gracefully');
      await prisma.$disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      debugLog('Received SIGTERM, shutting down gracefully');
      await prisma.$disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    debugLog('Fatal error during startup:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  debugLog('Unhandled error:', error);
  process.exit(1);
});