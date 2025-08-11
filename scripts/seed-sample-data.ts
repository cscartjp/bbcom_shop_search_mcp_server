import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedSampleData() {
  console.log('🌱 Seeding sample data...');

  try {
    // サンプルデータを作成
    const sampleItems = [
      {
        itemId: 1001,
        slug: 'blue-turtle-cafe',
        link: 'https://example.com/blue-turtle-cafe',
        title: 'ブルータートルカフェ',
        subtitle: '海を眺めながら楽しむカフェタイム',
        content: '宮古島の美しい海を眺めながら、こだわりのコーヒーと手作りスイーツをお楽しみいただけます。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.7286,
        longitude: 125.0276,
        address: '沖縄県宮古島市平良字西里123',
        categories: ['グルメ', 'カフェ', 'スイーツ'],
        tags: ['海が見える', 'Wi-Fi完備', 'テラス席あり'],
        phoneNumber: '0980-12-3456',
        openingHours: {
          monday: '10:00-18:00',
          tuesday: '10:00-18:00',
          wednesday: '定休日',
          thursday: '10:00-18:00',
          friday: '10:00-18:00',
          saturday: '9:00-19:00',
          sunday: '9:00-19:00'
        },
        email: 'info@blueturtle.example',
        web: 'https://blueturtle.example'
      },
      {
        itemId: 1002,
        slug: 'miyako-soba-honten',
        link: 'https://example.com/miyako-soba',
        title: '宮古そば本店',
        subtitle: '伝統の味を守り続ける老舗',
        content: '創業50年以上の歴史を持つ宮古そばの名店。毎日手作りする自家製麺と、じっくり煮込んだスープが自慢です。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.8054,
        longitude: 125.2814,
        address: '沖縄県宮古島市平良字下里456',
        categories: ['グルメ', '郷土料理', 'ランチ'],
        tags: ['宮古そば', '駐車場あり', '地元に人気'],
        phoneNumber: '0980-23-4567',
        openingHours: {
          monday: '11:00-15:00',
          tuesday: '11:00-15:00',
          wednesday: '11:00-15:00',
          thursday: '11:00-15:00',
          friday: '11:00-15:00',
          saturday: '11:00-16:00',
          sunday: '11:00-16:00'
        }
      },
      {
        itemId: 1003,
        slug: 'paradise-beach-resort',
        link: 'https://example.com/paradise-beach',
        title: 'パラダイスビーチリゾート',
        subtitle: '極上のリゾート体験を',
        content: '白い砂浜とエメラルドグリーンの海に囲まれた贅沢なリゾートホテル。プライベートビーチ、スパ、各種マリンアクティビティをご用意。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.7686,
        longitude: 125.3214,
        address: '沖縄県宮古島市城辺字保良789',
        categories: ['ライフ', '宿泊', 'リゾート'],
        tags: ['ビーチフロント', 'プール', 'スパ', '朝食付き'],
        phoneNumber: '0980-34-5678',
        web: 'https://paradisebeach.example'
      },
      {
        itemId: 1004,
        slug: 'marine-diving-shop',
        link: 'https://example.com/marine-diving',
        title: 'マリンダイビングショップ',
        subtitle: '初心者から上級者まで安心のダイビング体験',
        content: 'PADIライセンス取得コースから体験ダイビングまで。宮古島の美しい海中世界をご案内します。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.7486,
        longitude: 125.0076,
        address: '沖縄県宮古島市平良字松原321',
        categories: ['ライフ', 'マリンスポーツ', 'アクティビティ'],
        tags: ['ダイビング', 'シュノーケリング', '器材レンタル', '送迎あり'],
        phoneNumber: '0980-45-6789',
        email: 'diving@marine.example'
      },
      {
        itemId: 1005,
        slug: 'izakaya-paradise',
        link: 'https://example.com/izakaya-paradise',
        title: '居酒屋パラダイス',
        subtitle: '島の食材を使った創作料理',
        content: '宮古島の新鮮な海産物と島野菜を使った創作料理が楽しめる居酒屋。泡盛の種類も豊富です。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.8054,
        longitude: 125.2814,
        address: '沖縄県宮古島市平良字西里567',
        categories: ['グルメ', '居酒屋', 'ディナー'],
        tags: ['個室あり', '飲み放題', 'カード可', '予約可'],
        phoneNumber: '0980-56-7890',
        openingHours: {
          monday: '17:00-24:00',
          tuesday: '17:00-24:00',
          wednesday: '17:00-24:00',
          thursday: '17:00-24:00',
          friday: '17:00-25:00',
          saturday: '17:00-25:00',
          sunday: '17:00-23:00'
        }
      },
      {
        itemId: 1006,
        slug: 'miyako-beauty-salon',
        link: 'https://example.com/beauty-salon',
        title: '宮古ビューティーサロン',
        subtitle: 'リラックスできる癒しの空間',
        content: 'ヘアカット、カラー、パーマから、ネイル、エステまでトータルビューティーをご提供。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.8054,
        longitude: 125.2814,
        address: '沖縄県宮古島市平良字東仲宗根234',
        categories: ['ビューティー', 'ヘアサロン', 'エステ'],
        tags: ['予約制', '駐車場あり', 'クレジットカード可'],
        phoneNumber: '0980-67-8901'
      },
      {
        itemId: 1007,
        slug: 'hotel-staff-recruitment',
        link: 'https://example.com/job-hotel',
        title: 'ホテルスタッフ募集',
        subtitle: '未経験者歓迎！充実の研修制度',
        content: 'リゾートホテルでフロントスタッフ、レストランスタッフを募集しています。寮完備、社会保険完備。',
        status: 'publish' as const,
        author: 1,
        categories: ['求人情報', 'ホテル・旅館'],
        tags: ['正社員', '未経験可', '寮あり', '社保完備'],
        phoneNumber: '0980-78-9012',
        email: 'recruit@hotel.example'
      },
      {
        itemId: 1008,
        slug: 'italian-restaurant-miyako',
        link: 'https://example.com/italian-miyako',
        title: 'イタリアンレストラン宮古',
        subtitle: '本格イタリアンを宮古島で',
        content: '石窯で焼く本格ピッツァと手打ちパスタが自慢。ワインの品揃えも豊富です。',
        status: 'publish' as const,
        author: 1,
        latitude: 24.7286,
        longitude: 125.0276,
        address: '沖縄県宮古島市平良字下里890',
        categories: ['グルメ', 'レストラン', 'イタリアン'],
        tags: ['ランチあり', 'ディナー', 'ワイン', 'デート向き'],
        phoneNumber: '0980-89-0123',
        openingHours: {
          monday: '定休日',
          tuesday: '11:30-14:00, 17:30-21:00',
          wednesday: '11:30-14:00, 17:30-21:00',
          thursday: '11:30-14:00, 17:30-21:00',
          friday: '11:30-14:00, 17:30-22:00',
          saturday: '11:30-14:30, 17:30-22:00',
          sunday: '11:30-14:30, 17:30-21:00'
        }
      }
    ];

    // データを挿入
    for (const item of sampleItems) {
      await prisma.citadelaItem.create({
        data: item
      });
    }

    console.log(`✅ Successfully seeded ${sampleItems.length} sample items`);

    // 挿入されたデータの確認
    const count = await prisma.citadelaItem.count();
    console.log(`📊 Total items in database: ${count}`);

    const categories = await prisma.$queryRaw`
      SELECT DISTINCT unnest(categories) as category, COUNT(*) as count
      FROM citadela_items
      GROUP BY category
      ORDER BY count DESC
    `;
    console.log('📂 Categories:', categories);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });