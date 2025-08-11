import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { searchByCategory } from '../src/mcp/tools/search-by-category.js';
import { searchByLocation } from '../src/mcp/tools/search-by-location.js';
import { searchByTags } from '../src/mcp/tools/search-by-tags.js';
import { searchByText } from '../src/mcp/tools/search-by-text.js';
import { getItemById } from '../src/mcp/tools/get-item-by-id.js';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  log: ['error']
});

async function testTools() {
  console.log('🧪 Testing MCP Tools...\n');
  
  try {
    await prisma.$connect();
    
    // Test 1: Search by Category
    console.log('1️⃣ Testing searchByCategory...');
    const categoryResult = await searchByCategory(prisma, {
      category: 'グルメ',
      limit: 5,
      sortBy: 'updated',
      order: 'desc',
      status: 'publish'
    });
    console.log(`   Found ${categoryResult.total} items in グルメ category`);
    console.log(`   Returned ${categoryResult.items.length} items\n`);
    
    // Test 2: Search by Location (Miyako Airport area)
    console.log('2️⃣ Testing searchByLocation...');
    const locationResult = await searchByLocation(prisma, {
      latitude: 24.7828,  // Miyako Airport
      longitude: 125.2953,
      radiusKm: 2,
      limit: 5
    });
    console.log(`   Found ${locationResult.total} items within 2km of Miyako Airport`);
    if (locationResult.items.length > 0) {
      console.log(`   Closest item: ${locationResult.items[0].title} (${locationResult.items[0].distance}m)\n`);
    }
    
    // Test 3: Search by Tags
    console.log('3️⃣ Testing searchByTags...');
    const tagsResult = await searchByTags(prisma, {
      tags: ['ランチ', 'ディナー'],
      matchAll: false,  // OR logic
      limit: 5
    });
    console.log(`   Found ${tagsResult.total} items with tags: ${tagsResult.searchTags.join(' OR ')}`);
    console.log(`   Match mode: ${tagsResult.matchMode}\n`);
    
    // Test 4: Search by Text
    console.log('4️⃣ Testing searchByText...');
    const textResult = await searchByText(prisma, {
      query: '宮古島',
      searchIn: ['title', 'content'],
      limit: 5
    });
    console.log(`   Found ${textResult.total} items matching "宮古島"`);
    if (textResult.items.length > 0) {
      console.log(`   First match: ${textResult.items[0].title}`);
      if (textResult.items[0].snippet) {
        console.log(`   Snippet: ${textResult.items[0].snippet.substring(0, 100)}...\n`);
      }
    }
    
    // Test 5: Get Item by ID
    console.log('5️⃣ Testing getItemById...');
    // First get a valid item ID
    const sampleItem = await prisma.citadela_items.findFirst({
      where: { status: 'publish' }
    });
    
    if (sampleItem) {
      const itemDetail = await getItemById(prisma, {
        itemId: sampleItem.item_id
      });
      console.log(`   Retrieved item: ${itemDetail.title}`);
      console.log(`   Categories: ${itemDetail.categories.join(', ')}`);
      console.log(`   Has location: ${itemDetail.location.latitude ? 'Yes' : 'No'}`);
      console.log(`   Is open: ${itemDetail.businessInfo.isOpen !== null ? itemDetail.businessInfo.isOpen : 'Unknown'}\n`);
    }
    
    // Test 6: Combined search (category + location)
    console.log('6️⃣ Testing combined search (category + location sorting)...');
    const combinedResult = await searchByCategory(prisma, {
      category: 'グルメ',
      userLat: 24.8047,  // Miyakojima city center
      userLng: 125.2814,
      sortBy: 'distance',
      limit: 5
    });
    console.log(`   Found ${combinedResult.total} グルメ items`);
    if (combinedResult.items.length > 0 && combinedResult.items[0].distance) {
      console.log(`   Nearest: ${combinedResult.items[0].title} (${combinedResult.items[0].distance}m)\n`);
    }
    
    console.log('✅ All tool tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Tool test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testTools().catch(console.error);