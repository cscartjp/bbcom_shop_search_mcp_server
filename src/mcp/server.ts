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
import { 
  listCategories, 
  checkCategory,
  listCategoriesSchema,
  checkCategorySchema
} from './tools/categoryTools.js';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
});

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

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'searchByCategory',
    description: 'Search items by category with optional location-based sorting',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Category to search for'
        },
        subCategory: {
          type: 'string',
          description: 'Sub-category to search for'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (1-100)',
          minimum: 1,
          maximum: 100,
          default: 20
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
          minimum: 0,
          default: 0
        },
        userLat: {
          type: 'number',
          description: 'User latitude for distance sorting',
          minimum: -90,
          maximum: 90
        },
        userLng: {
          type: 'number',
          description: 'User longitude for distance sorting',
          minimum: -180,
          maximum: 180
        },
        sortBy: {
          type: 'string',
          description: 'Sort order',
          enum: ['created', 'updated', 'title', 'distance'],
          default: 'updated'
        },
        order: {
          type: 'string',
          description: 'Sort direction',
          enum: ['asc', 'desc'],
          default: 'desc'
        },
        status: {
          type: 'string',
          description: 'Publication status filter',
          enum: ['publish', 'draft', 'all'],
          default: 'publish'
        }
      }
    }
  },
  {
    name: 'searchByLocation',
    description: 'Search items within a radius from a specific location',
    inputSchema: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Center latitude',
          minimum: -90,
          maximum: 90
        },
        longitude: {
          type: 'number',
          description: 'Center longitude',
          minimum: -180,
          maximum: 180
        },
        radiusKm: {
          type: 'number',
          description: 'Search radius in kilometers',
          minimum: 0.1,
          maximum: 50,
          default: 1
        },
        category: {
          type: 'string',
          description: 'Category filter'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags filter'
        },
        onlyOpen: {
          type: 'boolean',
          description: 'Only return currently open places'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          minimum: 1,
          maximum: 100,
          default: 20
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
          minimum: 0,
          default: 0
        }
      },
      required: ['latitude', 'longitude']
    }
  },
  {
    name: 'searchByTags',
    description: 'Search items by tags with AND/OR logic',
    inputSchema: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to search for',
          minItems: 1
        },
        matchAll: {
          type: 'boolean',
          description: 'Match all tags (AND) vs any tag (OR)',
          default: false
        },
        category: {
          type: 'string',
          description: 'Category filter'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          minimum: 1,
          maximum: 100,
          default: 20
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
          minimum: 0,
          default: 0
        },
        userLat: {
          type: 'number',
          description: 'User latitude for distance sorting',
          minimum: -90,
          maximum: 90
        },
        userLng: {
          type: 'number',
          description: 'User longitude for distance sorting',
          minimum: -180,
          maximum: 180
        }
      },
      required: ['tags']
    }
  },
  {
    name: 'searchByText',
    description: 'Free text search across item titles, content, and addresses',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query text',
          minLength: 1
        },
        searchIn: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['title', 'subtitle', 'content', 'address']
          },
          description: 'Fields to search in',
          default: ['title', 'subtitle', 'content']
        },
        category: {
          type: 'string',
          description: 'Category filter'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags filter'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          minimum: 1,
          maximum: 100,
          default: 20
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
          minimum: 0,
          default: 0
        },
        userLat: {
          type: 'number',
          description: 'User latitude for distance sorting',
          minimum: -90,
          maximum: 90
        },
        userLng: {
          type: 'number',
          description: 'User longitude for distance sorting',
          minimum: -180,
          maximum: 180
        }
      },
      required: ['query']
    }
  },
  {
    name: 'getItemById',
    description: 'Get detailed information about a specific item by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        itemId: {
          type: 'number',
          description: 'The item ID to retrieve',
          minimum: 1
        }
      },
      required: ['itemId']
    }
  },
  {
    name: 'listCategories',
    description: 'Get a list of available categories (default: top 10 by item count)',
    inputSchema: {
      type: 'object',
      properties: {
        includeCount: {
          type: 'boolean',
          description: 'Include item count for each category',
          default: true
        },
        orderBy: {
          type: 'string',
          description: 'Sort order for categories',
          enum: ['name', 'item_count', 'created_at'],
          default: 'item_count'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of categories to return',
          minimum: 1,
          maximum: 100,
          default: 10
        }
      }
    }
  },
  {
    name: 'checkCategory',
    description: 'Check if a specific category exists in the database',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Category name to check',
          minLength: 1
        },
        fuzzy: {
          type: 'boolean',
          description: 'Use fuzzy matching for category name',
          default: false
        }
      },
      required: ['name']
    }
  }
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'searchByCategory': {
        const params = searchByCategorySchema.parse(args);
        const result = await searchByCategory(prisma, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'searchByLocation': {
        const params = searchByLocationSchema.parse(args);
        const result = await searchByLocation(prisma, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'searchByTags': {
        const params = searchByTagsSchema.parse(args);
        const result = await searchByTags(prisma, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'searchByText': {
        const params = searchByTextSchema.parse(args);
        const result = await searchByText(prisma, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'getItemById': {
        const params = getItemByIdSchema.parse(args);
        const result = await getItemById(prisma, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'listCategories': {
        const params = listCategoriesSchema.parse(args);
        const result = await listCategories(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'checkCategory': {
        const params = checkCategorySchema.parse(args);
        const result = await checkCategory(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.error('Database connected successfully');

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main().catch(console.error);