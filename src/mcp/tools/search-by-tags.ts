import { PrismaClient, Prisma } from '@prisma/client';
import { SearchByTagsParams } from '../schemas/index.js';

export async function searchByTags(
  prisma: PrismaClient,
  params: SearchByTagsParams
) {
  const {
    tags,
    matchAll = false,
    category,
    limit = 20,
    offset = 0,
    userLat,
    userLng
  } = params;

  // Build where clause
  const where: Prisma.citadela_itemsWhereInput = {
    status: 'publish'
  };

  // Add tags filter
  if (matchAll) {
    // Match ALL tags (AND logic)
    where.tags = {
      hasEvery: tags
    };
  } else {
    // Match ANY tag (OR logic)
    where.tags = {
      hasSome: tags
    };
  }

  // Add category filter
  if (category) {
    where.categories = {
      has: category
    };
  }

  // If user location is provided, use raw query for distance calculation
  if (userLat && userLng) {
    const tagCondition = matchAll 
      ? Prisma.sql`tags @> ${tags}::text[]`
      : Prisma.sql`tags && ${tags}::text[]`;
    
    const categoryCondition = category 
      ? Prisma.sql`AND ${category} = ANY(categories)`
      : Prisma.sql``;

    const items = await prisma.$queryRaw<any[]>`
      SELECT 
        item_id,
        title,
        subtitle,
        content,
        address,
        latitude,
        longitude,
        categories,
        tags,
        status,
        opening_hours,
        telephone,
        email,
        web_url,
        created_at,
        updated_at,
        CASE 
          WHEN location IS NOT NULL THEN 
            ST_Distance(
              location::geography,
              ST_MakePoint(${userLng}, ${userLat})::geography
            )
          ELSE NULL
        END as distance
      FROM citadela_items
      WHERE 
        status = 'publish'
        AND ${tagCondition}
        ${categoryCondition}
      ORDER BY 
        CASE 
          WHEN location IS NOT NULL THEN 
            ST_Distance(
              location::geography,
              ST_MakePoint(${userLng}, ${userLat})::geography
            )
          ELSE 999999999
        END ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const total = await prisma.citadela_items.count({ where });

    return {
      items: items.map(item => ({
        ...item,
        distance: item.distance ? Math.round(item.distance) : null,
        matchedTags: tags.filter(tag => item.tags?.includes(tag))
      })),
      total,
      hasMore: offset + items.length < total,
      searchTags: tags,
      matchMode: matchAll ? 'all' : 'any'
    };
  }

  // Regular query without distance calculation
  const [items, total] = await Promise.all([
    prisma.citadela_items.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        item_id: true,
        title: true,
        subtitle: true,
        content: true,
        address: true,
        latitude: true,
        longitude: true,
        categories: true,
        tags: true,
        status: true,
        opening_hours: true,
        telephone: true,
        email: true,
        web_url: true,
        created_at: true,
        updated_at: true
      }
    }),
    prisma.citadela_items.count({ where })
  ]);

  // Add matched tags info
  const itemsWithMatchedTags = items.map(item => ({
    ...item,
    matchedTags: tags.filter(tag => item.tags?.includes(tag))
  }));

  return {
    items: itemsWithMatchedTags,
    total,
    hasMore: offset + items.length < total,
    searchTags: tags,
    matchMode: matchAll ? 'all' : 'any'
  };
}