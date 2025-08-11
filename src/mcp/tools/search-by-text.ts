import { PrismaClient, Prisma } from '@prisma/client';
import { SearchByTextParams } from '../schemas/index.js';

export async function searchByText(
  prisma: PrismaClient,
  params: SearchByTextParams
) {
  const {
    query,
    searchIn = ['title', 'subtitle', 'content'],
    category,
    tags,
    limit = 20,
    offset = 0,
    userLat,
    userLng
  } = params;

  // Build where clause for text search
  const searchConditions: Prisma.CitadelaItemWhereInput[] = [];
  
  if (searchIn.includes('title')) {
    searchConditions.push({
      title: {
        contains: query,
        mode: 'insensitive'
      }
    });
  }
  
  if (searchIn.includes('subtitle')) {
    searchConditions.push({
      subtitle: {
        contains: query,
        mode: 'insensitive'
      }
    });
  }
  
  if (searchIn.includes('content')) {
    searchConditions.push({
      content: {
        contains: query,
        mode: 'insensitive'
      }
    });
  }
  
  if (searchIn.includes('address')) {
    searchConditions.push({
      address: {
        contains: query,
        mode: 'insensitive'
      }
    });
  }

  const where: Prisma.CitadelaItemWhereInput = {
    status: 'publish',
    OR: searchConditions.length > 0 ? searchConditions : undefined
  };

  // Add category filter
  if (category) {
    where.categories = {
      has: category
    };
  }

  // Add tags filter
  if (tags && tags.length > 0) {
    where.tags = {
      hasSome: tags
    };
  }

  // If user location is provided, use raw query for distance calculation
  if (userLat && userLng) {
    // Build search conditions for raw query
    const searchFields = searchIn.map(field => {
      const columnMap: Record<string, string> = {
        'title': 'title',
        'subtitle': 'subtitle',
        'content': 'content',
        'address': 'address'
      };
      return `LOWER(${columnMap[field]}) LIKE LOWER($1)`;
    }).join(' OR ');

    const categoryCondition = category 
      ? Prisma.sql`AND ${category} = ANY(categories)`
      : Prisma.sql``;
    
    const tagsCondition = tags && tags.length > 0
      ? Prisma.sql`AND tags && ${tags}::text[]`
      : Prisma.sql``;

    const searchPattern = `%${query}%`;

    const items = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        "item_id" as "itemId",
        title,
        subtitle,
        content,
        address,
        latitude,
        longitude,
        categories,
        tags,
        status,
        "openingHours",
        "phoneNumber",
        "telephoneNumber",
        email,
        web,
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        CASE 
          WHEN location IS NOT NULL THEN 
            ST_Distance(
              location::geography,
              ST_MakePoint($2, $3)::geography
            )
          ELSE NULL
        END as distance,
        CASE
          WHEN LOWER(title) LIKE LOWER($1) THEN 1
          WHEN LOWER(subtitle) LIKE LOWER($1) THEN 2
          WHEN LOWER(content) LIKE LOWER($1) THEN 3
          WHEN LOWER(address) LIKE LOWER($1) THEN 4
          ELSE 5
        END as relevance
      FROM citadela_items
      WHERE 
        status = 'publish'
        AND (${searchFields})
        ${categoryCondition}
        ${tagsCondition}
      ORDER BY 
        relevance ASC,
        CASE 
          WHEN location IS NOT NULL THEN 
            ST_Distance(
              location::geography,
              ST_MakePoint($2, $3)::geography
            )
          ELSE 999999999
        END ASC
      LIMIT $4
      OFFSET $5
    `, searchPattern, userLng, userLat, limit, offset);

    const total = await prisma.citadelaItem.count({ where });

    return {
      items: items.map(item => ({
        ...item,
        distance: item.distance ? Math.round(item.distance) : null,
        snippet: generateSnippet(item, query, searchIn)
      })),
      total,
      hasMore: offset + items.length < total,
      searchQuery: query,
      searchFields: searchIn
    };
  }

  // Regular query without distance calculation
  const [items, total] = await Promise.all([
    prisma.citadelaItem.findMany({
      where,
      orderBy: [
        // Prioritize title matches
        { title: 'asc' },
        { updatedAt: 'desc' }
      ],
      take: limit,
      skip: offset,
      select: {
        itemId: true,
        title: true,
        subtitle: true,
        content: true,
        address: true,
        latitude: true,
        longitude: true,
        categories: true,
        tags: true,
        status: true,
        openingHours: true,
        phoneNumber: true,
        telephoneNumber: true,
        email: true,
        web: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.citadelaItem.count({ where })
  ]);

  // Add search snippets
  const itemsWithSnippets = items.map(item => ({
    ...item,
    snippet: generateSnippet(item, query, searchIn)
  }));

  return {
    items: itemsWithSnippets,
    total,
    hasMore: offset + items.length < total,
    searchQuery: query,
    searchFields: searchIn
  };
}

function generateSnippet(
  item: any,
  query: string,
  searchIn: string[]
): string {
  const maxLength = 150;
  const queryLower = query.toLowerCase();
  
  // Try to find the query in each field
  for (const field of searchIn) {
    const text = item[field];
    if (!text) continue;
    
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);
    
    if (index !== -1) {
      // Found the query in this field
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + query.length + 100);
      
      let snippet = text.substring(start, end);
      
      // Add ellipsis if needed
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      // Highlight the query (simplified - in production you'd want proper highlighting)
      const regex = new RegExp(`(${query})`, 'gi');
      snippet = snippet.replace(regex, '**$1**');
      
      return snippet;
    }
  }
  
  // If query not found, return beginning of content or subtitle
  const fallbackText = item.content || item.subtitle || '';
  if (fallbackText.length > maxLength) {
    return fallbackText.substring(0, maxLength) + '...';
  }
  return fallbackText;
}