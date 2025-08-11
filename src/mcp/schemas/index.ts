import { z } from 'zod';

export const searchByCategorySchema = z.object({
  category: z.string().optional().describe('Category to search for'),
  subCategory: z.string().optional().describe('Sub-category to search for'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum number of results'),
  offset: z.number().min(0).default(0).describe('Pagination offset'),
  userLat: z.number().min(-90).max(90).optional().describe('User latitude for distance sorting'),
  userLng: z.number().min(-180).max(180).optional().describe('User longitude for distance sorting'),
  sortBy: z.enum(['created', 'updated', 'title', 'distance']).default('updated').describe('Sort order'),
  order: z.enum(['asc', 'desc']).default('desc').describe('Sort direction'),
  status: z.enum(['publish', 'draft', 'all']).default('publish').describe('Publication status filter')
});

export const searchByLocationSchema = z.object({
  latitude: z.number().min(-90).max(90).describe('Center latitude'),
  longitude: z.number().min(-180).max(180).describe('Center longitude'),
  radiusKm: z.number().min(0.1).max(50).default(1).describe('Search radius in kilometers'),
  category: z.string().optional().describe('Category filter'),
  tags: z.array(z.string()).optional().describe('Tags filter'),
  onlyOpen: z.boolean().optional().describe('Only return currently open places'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum number of results'),
  offset: z.number().min(0).default(0).describe('Pagination offset')
});

export const searchByTagsSchema = z.object({
  tags: z.array(z.string()).min(1).describe('Tags to search for'),
  matchAll: z.boolean().default(false).describe('Match all tags (AND) vs any tag (OR)'),
  category: z.string().optional().describe('Category filter'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum number of results'),
  offset: z.number().min(0).default(0).describe('Pagination offset'),
  userLat: z.number().min(-90).max(90).optional().describe('User latitude for distance sorting'),
  userLng: z.number().min(-180).max(180).optional().describe('User longitude for distance sorting')
});

export const searchByTextSchema = z.object({
  query: z.string().min(1).describe('Search query text'),
  searchIn: z.array(z.enum(['title', 'subtitle', 'content', 'address'])).default(['title', 'subtitle', 'content']).describe('Fields to search in'),
  category: z.string().optional().describe('Category filter'),
  tags: z.array(z.string()).optional().describe('Tags filter'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum number of results'),
  offset: z.number().min(0).default(0).describe('Pagination offset'),
  userLat: z.number().min(-90).max(90).optional().describe('User latitude for distance sorting'),
  userLng: z.number().min(-180).max(180).optional().describe('User longitude for distance sorting')
});

export const getItemByIdSchema = z.object({
  itemId: z.number().positive().describe('The item ID to retrieve')
});

export type SearchByCategoryParams = z.infer<typeof searchByCategorySchema>;
export type SearchByLocationParams = z.infer<typeof searchByLocationSchema>;
export type SearchByTagsParams = z.infer<typeof searchByTagsSchema>;
export type SearchByTextParams = z.infer<typeof searchByTextSchema>;
export type GetItemByIdParams = z.infer<typeof getItemByIdSchema>;