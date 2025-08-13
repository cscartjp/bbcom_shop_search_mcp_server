import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const listCategoriesSchema = z.object({
  includeCount: z.boolean().optional().describe('Include item count for each category'),
  orderBy: z.enum(['name', 'item_count', 'created_at']).optional().default('item_count').describe('Sort order for categories'),
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of categories to return')
});

export const checkCategorySchema = z.object({
  name: z.string().describe('Category name to check'),
  fuzzy: z.boolean().optional().default(false).describe('Use fuzzy matching for category name')
});

export async function listCategories(params: z.infer<typeof listCategoriesSchema>) {
  try {
    const { includeCount = true, orderBy = 'item_count', limit = 10 } = params;
    
    const orderByClause = orderBy === 'item_count' 
      ? { item_count: 'desc' as const }
      : orderBy === 'created_at'
      ? { created_at: 'desc' as const }
      : { name: 'asc' as const };
    
    const categories = await prisma.citadela_categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        item_count: includeCount,
        created_at: true,
        updated_at: true
      },
      orderBy: orderByClause,
      take: limit
    });
    
    return {
      success: true,
      count: categories.length,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || undefined,
        description: cat.description || undefined,
        ...(includeCount && { itemCount: cat.item_count }),
        createdAt: cat.created_at.toISOString(),
        updatedAt: cat.updated_at.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error listing categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      categories: []
    };
  }
}

export async function checkCategory(params: z.infer<typeof checkCategorySchema>) {
  try {
    const { name, fuzzy = false } = params;
    
    let category;
    
    if (fuzzy) {
      // Case-insensitive partial matching
      category = await prisma.citadela_categories.findFirst({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          item_count: true,
          created_at: true,
          updated_at: true
        }
      });
    } else {
      // Exact match (case-insensitive)
      category = await prisma.citadela_categories.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          item_count: true,
          created_at: true,
          updated_at: true
        }
      });
    }
    
    if (category) {
      return {
        success: true,
        exists: true,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug || undefined,
          description: category.description || undefined,
          itemCount: category.item_count,
          createdAt: category.created_at.toISOString(),
          updatedAt: category.updated_at.toISOString()
        }
      };
    }
    
    // If not found, suggest similar categories
    const suggestions = await prisma.citadela_categories.findMany({
      where: {
        name: {
          contains: name.split(' ')[0], // Use first word for suggestions
          mode: 'insensitive'
        }
      },
      select: {
        name: true
      },
      take: 5
    });
    
    return {
      success: true,
      exists: false,
      message: `Category "${name}" not found`,
      suggestions: suggestions.map(s => s.name)
    };
  } catch (error) {
    console.error('Error checking category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}