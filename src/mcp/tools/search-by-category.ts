import { PrismaClient, Prisma } from '@prisma/client';
import { SearchByCategoryParams } from '../schemas/index.js';

export async function searchByCategory(
  prisma: PrismaClient,
  params: SearchByCategoryParams
) {
  const {
    category,
    subCategory,
    limit = 20,
    offset = 0,
    userLat,
    userLng,
    sortBy = 'updated',
    order = 'desc',
    status = 'publish'
  } = params;

  // Build where clause
  const where: Prisma.CitadelaItemWhereInput = {};
  
  if (status !== 'all') {
    where.status = status;
  }
  
  if (category || subCategory) {
    const categories = [];
    if (category) categories.push(category);
    if (subCategory) categories.push(subCategory);
    
    where.categories = {
      hasEvery: categories
    };
  }

  // Build orderBy clause
  let orderBy: Prisma.CitadelaItemOrderByWithRelationInput | Prisma.CitadelaItemOrderByWithRelationInput[] = {};
  
  if (sortBy === 'distance' && userLat && userLng) {
    // For distance sorting, we'll need to use raw query
    const items = await prisma.$queryRaw<any[]>`
      SELECT 
        "item_id" as "itemId",
        title,
        subtitle,
        address,
        latitude,
        longitude,
        categories,
        tags,
        status,
        "opening_hours" as "openingHours",
        "phone_number" as "phoneNumber",
        "telephone_number" as "telephoneNumber",
        email,
        web,
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
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
        ${status !== 'all' ? Prisma.sql`status = ${status}` : Prisma.sql`TRUE`}
        ${category || subCategory ? Prisma.sql`AND categories @> ${[category, subCategory].filter(Boolean)}::text[]` : Prisma.sql``}
      ORDER BY 
        CASE 
          WHEN location IS NOT NULL THEN 
            ST_Distance(
              location::geography,
              ST_MakePoint(${userLng}, ${userLat})::geography
            )
          ELSE 999999999
        END ${order === 'asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    
    const total = await prisma.citadelaItem.count({ where });
    
    return {
      items: items.map(item => ({
        ...item,
        distance: item.distance ? Math.round(item.distance) : null
      })),
      total,
      hasMore: offset + items.length < total
    };
  } else {
    // Regular sorting
    switch (sortBy) {
      case 'created':
        orderBy = { createdAt: order };
        break;
      case 'updated':
        orderBy = { updatedAt: order };
        break;
      case 'title':
        orderBy = { title: order };
        break;
      default:
        orderBy = { updatedAt: 'desc' };
    }
  }

  // Execute query
  const [items, total] = await Promise.all([
    prisma.citadelaItem.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        itemId: true,
        title: true,
        subtitle: true,
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

  // Calculate distances if user location provided
  let itemsWithDistance = items;
  if (userLat && userLng && sortBy !== 'distance') {
    itemsWithDistance = items.map(item => ({
      ...item,
      distance: item.latitude && item.longitude
        ? calculateDistance(userLat, userLng, item.latitude, item.longitude)
        : null
    }));
  }

  return {
    items: itemsWithDistance,
    total,
    hasMore: offset + items.length < total
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI/180);
}