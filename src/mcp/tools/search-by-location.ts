import { PrismaClient } from '@prisma/client';
import { SearchByLocationParams } from '../schemas/index.js';

export async function searchByLocation(
  prisma: PrismaClient,
  params: SearchByLocationParams
) {
  const {
    latitude,
    longitude,
    radiusKm = 1,
    category,
    tags,
    onlyOpen,
    limit = 20,
    offset = 0
  } = params;

  const radiusMeters = radiusKm * 1000;

  // Build the query with PostGIS spatial functions
  let whereConditions: string[] = ['status = $1'];
  let queryParams: any[] = ['publish'];
  let paramCounter = 2;

  // Add spatial condition
  whereConditions.push(
    `ST_DWithin(location::geography, ST_MakePoint($${paramCounter}, $${paramCounter + 1})::geography, $${paramCounter + 2})`
  );
  queryParams.push(longitude, latitude, radiusMeters);
  paramCounter += 3;

  // Add category filter
  if (category) {
    whereConditions.push(`$${paramCounter} = ANY(categories)`);
    queryParams.push(category);
    paramCounter++;
  }

  // Add tags filter
  if (tags && tags.length > 0) {
    whereConditions.push(`categories && $${paramCounter}::text[]`);
    queryParams.push(tags);
    paramCounter++;
  }

  // Check if place is open (simplified - would need proper time handling)
  if (onlyOpen) {
    // This is a simplified check - in production you'd parse opening_hours JSON properly
    whereConditions.push(`opening_hours IS NOT NULL`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Execute the spatial query
  const items = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      item_id,
      title,
      subtitle,
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
      ST_Distance(
        location::geography,
        ST_MakePoint($2, $3)::geography
      ) as distance
    FROM citadela_items
    WHERE ${whereClause}
    ORDER BY distance ASC
    LIMIT $${paramCounter}
    OFFSET $${paramCounter + 1}
  `, ...queryParams, limit, offset);

  // Get total count
  const totalResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(`
    SELECT COUNT(*) as count
    FROM citadela_items
    WHERE ${whereClause}
  `, ...queryParams);

  const total = Number(totalResult[0].count);

  // Check if currently open (simplified implementation)
  const itemsWithOpenStatus = items.map(item => {
    let isOpen = null;
    
    if (item.openingHours && onlyOpen) {
      try {
        const hours = typeof item.openingHours === 'string' 
          ? JSON.parse(item.openingHours) 
          : item.openingHours;
        
        isOpen = checkIfOpen(hours);
      } catch (error) {
        console.error('Error parsing opening hours:', error);
      }
    }
    
    return {
      ...item,
      distance: Math.round(item.distance),
      isOpen
    };
  });

  return {
    items: itemsWithOpenStatus,
    total,
    hasMore: offset + items.length < total,
    searchRadius: radiusKm,
    centerLocation: {
      latitude,
      longitude
    }
  };
}

function checkIfOpen(openingHours: any): boolean {
  if (!openingHours) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  // Check if there's data for current day
  const todayHours = openingHours[currentDay];
  if (!todayHours) return false;
  
  // Check if it's 24/7
  if (todayHours === '24/7' || todayHours === '24時間') return true;
  
  // Check if closed
  if (todayHours === 'closed' || todayHours === '休み' || todayHours === '定休日') return false;
  
  // Parse time ranges (simplified - would need more robust parsing in production)
  if (typeof todayHours === 'string' && todayHours.includes('-')) {
    const [open, close] = todayHours.split('-').map(t => t.trim());
    return currentTime >= open && currentTime <= close;
  }
  
  return false;
}