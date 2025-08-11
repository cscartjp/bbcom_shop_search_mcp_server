import { PrismaClient } from '@prisma/client';
import { GetItemByIdParams } from '../schemas/index.js';

export async function getItemById(
  prisma: PrismaClient,
  params: GetItemByIdParams
) {
  const { itemId } = params;

  const item = await prisma.citadela_items.findUnique({
    where: {
      item_id: itemId
    }
  });

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found`);
  }

  // Parse opening hours if it's a JSON string
  let parsedOpeningHours = item.opening_hours;
  if (typeof item.opening_hours === 'string') {
    try {
      parsedOpeningHours = JSON.parse(item.opening_hours);
    } catch (error) {
      console.error('Error parsing opening hours:', error);
    }
  }



  // Check if currently open
  const isOpen = checkIfOpen(parsedOpeningHours);

  // Format the response
  return {
    itemId: item.item_id,
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    content: item.content,
    status: item.status,
    location: {
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address
    },
    categories: item.categories,
    tags: item.tags,
    contact: {
      telephone: item.telephone,
      email: item.show_email ? item.email : null,
      web: item.web_url,
      webLabel: item.web_url_label
    },
    businessInfo: {
      openingHours: parsedOpeningHours,
      showOpeningHours: item.show_opening_hours,
      isOpen: isOpen,
      mapEnabled: item.map_enabled,
      streetviewEnabled: item.streetview_enabled,
      swheading: item.swheading,
      swpitch: item.swpitch,
      swzoom: item.swzoom
    },
    featured: item.featured,
    useContactForm: item.use_contact_form,
    taxMap: item.tax_map,
    timestamps: {
      created: item.created_at,
      updated: item.updated_at
    }
  };
}

function checkIfOpen(openingHours: any): boolean | null {
  if (!openingHours) return null;
  
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const localTime = new Date(now.getTime() + (jstOffset * 60 * 1000));
  
  const currentDay = localTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = localTime.toTimeString().slice(0, 5);
  
  // Check if there's data for current day
  const todayHours = openingHours[currentDay];
  if (!todayHours) return null;
  
  // Check if it's 24/7
  if (todayHours === '24/7' || todayHours === '24時間') return true;
  
  // Check if closed
  if (todayHours === 'closed' || todayHours === '休み' || todayHours === '定休日') return false;
  
  // Parse time ranges
  if (typeof todayHours === 'object' && todayHours.open && todayHours.close) {
    const openTime = todayHours.open;
    const closeTime = todayHours.close;
    
    // Handle cases where close time is after midnight
    if (closeTime < openTime) {
      // Shop closes after midnight
      return currentTime >= openTime || currentTime <= closeTime;
    } else {
      return currentTime >= openTime && currentTime <= closeTime;
    }
  }
  
  // Simple string format "09:00-18:00"
  if (typeof todayHours === 'string' && todayHours.includes('-')) {
    const [open, close] = todayHours.split('-').map(t => t.trim());
    
    // Handle cases where close time is after midnight
    if (close < open) {
      return currentTime >= open || currentTime <= close;
    } else {
      return currentTime >= open && currentTime <= close;
    }
  }
  
  return null;
}