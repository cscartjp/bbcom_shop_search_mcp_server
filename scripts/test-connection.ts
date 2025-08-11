import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

async function testConnection() {
  console.log('Testing database connection...\n');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test PostGIS extension
    const postgisCheck = await prisma.$queryRaw<any[]>`
      SELECT PostGIS_version() as version
    `;
    console.log(`✅ PostGIS installed: ${postgisCheck[0].version}`);
    
    // Count items in database
    const itemCount = await prisma.citadela_items.count();
    console.log(`✅ Total items in database: ${itemCount}`);
    
    // Get categories summary
    const categories = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT unnest(categories) as category, COUNT(*) as count
      FROM citadela_items
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `;
    
    console.log('\n📊 Top categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.category}: ${cat.count} items`);
    });
    
    // Test spatial query
    const spatialTest = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count
      FROM citadela_items
      WHERE location IS NOT NULL
    `;
    console.log(`\n📍 Items with location data: ${spatialTest[0].count}`);
    
    // Get sample item
    const sampleItem = await prisma.citadela_items.findFirst({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    if (sampleItem) {
      console.log('\n📝 Sample item:');
      console.log(`  - ID: ${sampleItem.item_id}`);
      console.log(`  - Title: ${sampleItem.title}`);
      console.log(`  - Location: ${sampleItem.latitude}, ${sampleItem.longitude}`);
      console.log(`  - Categories: ${sampleItem.categories.join(', ')}`);
    }
    
    console.log('\n✅ All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);