export interface Landmark {
  name: string;
  nameKana?: string;
  nameEnglish?: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
}

export const MIYAKOJIMA_LANDMARKS: Landmark[] = [
  // 空港・港
  {
    name: '宮古空港',
    nameKana: 'みやこくうこう',
    nameEnglish: 'Miyako Airport',
    category: 'transport',
    latitude: 24.7828,
    longitude: 125.2953,
    address: '沖縄県宮古島市平良字下里1657-128'
  },
  {
    name: '平良港',
    nameKana: 'ひららこう',
    nameEnglish: 'Hirara Port',
    category: 'transport',
    latitude: 24.8039,
    longitude: 125.2775,
    address: '沖縄県宮古島市平良西里'
  },
  
  // 観光地・ビーチ
  {
    name: '与那覇前浜ビーチ',
    nameKana: 'よなはまえはまビーチ',
    nameEnglish: 'Yonaha Maehama Beach',
    category: 'beach',
    latitude: 24.7289,
    longitude: 125.2608,
    address: '沖縄県宮古島市下地与那覇'
  },
  {
    name: '砂山ビーチ',
    nameKana: 'すなやまビーチ',
    nameEnglish: 'Sunayama Beach',
    category: 'beach',
    latitude: 24.8264,
    longitude: 125.2644,
    address: '沖縄県宮古島市平良荷川取'
  },
  {
    name: '東平安名崎',
    nameKana: 'ひがしへんなざき',
    nameEnglish: 'Higashi-Hennazaki',
    category: 'sightseeing',
    latitude: 24.7169,
    longitude: 125.4678,
    address: '沖縄県宮古島市城辺保良'
  },
  {
    name: '池間大橋',
    nameKana: 'いけまおおはし',
    nameEnglish: 'Ikema Bridge',
    category: 'sightseeing',
    latitude: 24.9333,
    longitude: 125.2833,
    address: '沖縄県宮古島市平良池間'
  },
  {
    name: '伊良部大橋',
    nameKana: 'いらぶおおはし',
    nameEnglish: 'Irabu Bridge',
    category: 'sightseeing',
    latitude: 24.8228,
    longitude: 125.2506,
    address: '沖縄県宮古島市平良久貝'
  },
  {
    name: '来間大橋',
    nameKana: 'くりまおおはし',
    nameEnglish: 'Kurima Bridge',
    category: 'sightseeing',
    latitude: 24.7361,
    longitude: 125.2722,
    address: '沖縄県宮古島市下地来間'
  },
  
  // 市街地・商業エリア
  {
    name: '西里大通り',
    nameKana: 'にしざとおおどおり',
    nameEnglish: 'Nishizato Street',
    category: 'shopping',
    latitude: 24.8047,
    longitude: 125.2817,
    address: '沖縄県宮古島市平良西里'
  },
  {
    name: '公設市場',
    nameKana: 'こうせついちば',
    nameEnglish: 'Public Market',
    category: 'shopping',
    latitude: 24.8058,
    longitude: 125.2819,
    address: '沖縄県宮古島市平良下里'
  },
  {
    name: 'イオンタウン宮古',
    nameKana: 'イオンタウンみやこ',
    nameEnglish: 'AEON Town Miyako',
    category: 'shopping',
    latitude: 24.7889,
    longitude: 125.2814,
    address: '沖縄県宮古島市平良松原631'
  },
  {
    name: 'サンエー宮古島シティ',
    nameKana: 'サンエーみやこじまシティ',
    nameEnglish: 'San-A Miyakojima City',
    category: 'shopping',
    latitude: 24.7981,
    longitude: 125.2792,
    address: '沖縄県宮古島市平良下里南真久底2511-43'
  },
  
  // 公共施設
  {
    name: '宮古島市役所',
    nameKana: 'みやこじましやくしょ',
    nameEnglish: 'Miyakojima City Hall',
    category: 'public',
    latitude: 24.8047,
    longitude: 125.2814,
    address: '沖縄県宮古島市平良西里1140'
  },
  {
    name: '宮古病院',
    nameKana: 'みやこびょういん',
    nameEnglish: 'Miyako Hospital',
    category: 'hospital',
    latitude: 24.7972,
    longitude: 125.2828,
    address: '沖縄県宮古島市平良下里427-1'
  },
  
  // 宿泊施設エリア
  {
    name: 'シギラリゾート',
    nameKana: 'シギラリゾート',
    nameEnglish: 'Shigira Resort',
    category: 'resort',
    latitude: 24.7319,
    longitude: 125.3614,
    address: '沖縄県宮古島市上野新里'
  },
  
  // 池間島
  {
    name: '池間島',
    nameKana: 'いけまじま',
    nameEnglish: 'Ikema Island',
    category: 'island',
    latitude: 24.9361,
    longitude: 125.2667,
    address: '沖縄県宮古島市池間'
  },
  
  // 伊良部島
  {
    name: '伊良部島',
    nameKana: 'いらぶじま',
    nameEnglish: 'Irabu Island',
    category: 'island',
    latitude: 24.8333,
    longitude: 125.2000,
    address: '沖縄県宮古島市伊良部'
  },
  {
    name: '下地島空港',
    nameKana: 'しもじしまくうこう',
    nameEnglish: 'Shimojishima Airport',
    category: 'transport',
    latitude: 24.8267,
    longitude: 125.1450,
    address: '沖縄県宮古島市伊良部佐和田'
  },
  
  // 来間島
  {
    name: '来間島',
    nameKana: 'くりまじま',
    nameEnglish: 'Kurima Island',
    category: 'island',
    latitude: 24.7281,
    longitude: 125.2592,
    address: '沖縄県宮古島市下地来間'
  }
];

export function findLandmark(name: string): Landmark | undefined {
  const normalizedName = name.toLowerCase().trim();
  
  return MIYAKOJIMA_LANDMARKS.find(landmark => {
    const names = [
      landmark.name,
      landmark.nameKana,
      landmark.nameEnglish
    ].filter(Boolean).map(n => n!.toLowerCase());
    
    return names.some(n => 
      n === normalizedName || 
      n.includes(normalizedName) || 
      normalizedName.includes(n)
    );
  });
}

export function findNearestLandmark(lat: number, lng: number): Landmark | undefined {
  if (!MIYAKOJIMA_LANDMARKS.length) return undefined;
  
  let nearest = MIYAKOJIMA_LANDMARKS[0];
  let minDistance = calculateDistance(lat, lng, nearest.latitude, nearest.longitude);
  
  for (const landmark of MIYAKOJIMA_LANDMARKS) {
    const distance = calculateDistance(lat, lng, landmark.latitude, landmark.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = landmark;
    }
  }
  
  return nearest;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI/180);
}