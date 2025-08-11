import { PrismaClient } from '@prisma/client';
import { GetItemByIdParams } from '../schemas/index.js';

export async function getItemById(
  prisma: PrismaClient,
  params: GetItemByIdParams
) {
  const { itemId } = params;

  const item = await prisma.citadelaItem.findUnique({
    where: {
      itemId: itemId
    }
  });

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found`);
  }

  // Parse opening hours if it's a JSON string
  let parsedOpeningHours = item.openingHours;
  if (typeof item.openingHours === 'string') {
    try {
      parsedOpeningHours = JSON.parse(item.openingHours);
    } catch (error) {
      console.error('Error parsing opening hours:', error);
    }
  }

  // Parse social icons if it's a JSON string
  let parsedSocialIcons = item.socialIcons;
  if (typeof item.socialIcons === 'string') {
    try {
      parsedSocialIcons = JSON.parse(item.socialIcons);
    } catch (error) {
      console.error('Error parsing social icons:', error);
    }
  }

  // Parse custom fields if it's a JSON string
  let parsedCustomFields = item.customFields;
  if (typeof item.customFields === 'string') {
    try {
      parsedCustomFields = JSON.parse(item.customFields);
    } catch (error) {
      console.error('Error parsing custom fields:', error);
    }
  }

  // Check if currently open
  const isOpen = checkIfOpen(parsedOpeningHours);

  // Format the response
  return {
    itemId: item.itemId,
    slug: item.slug,
    link: item.link,
    title: item.title,
    subtitle: item.subtitle,
    content: item.content,
    status: item.status,
    author: item.author,
    location: {
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address
    },
    categories: item.categories,
    tags: item.tags,
    media: {
      featuredImage: item.featuredImage,
      galleryImages: item.galleryImages
    },
    contact: {
      phoneNumber: item.phoneNumber,
      telephoneNumber: item.telephoneNumber,
      email: item.showEmail ? item.email : null,
      web: item.showWeb ? item.web : null
    },
    businessInfo: {
      openingHours: parsedOpeningHours,
      isOpen: isOpen,
      features: item.features
    },
    socialMedia: parsedSocialIcons,
    customFields: parsedCustomFields,
    timestamps: {
      created: item.createdAt,
      updated: item.updatedAt,
      published: item.publishedAt
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