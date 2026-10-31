import { Router } from 'express';
import { getProducts, getProductBySlug, addProductReview, deleteProductReview } from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/products/:slug/reviews', protect, addProductReview);
router.delete('/products/:slug/reviews/:reviewId', protect, deleteProductReview);

export default router;

const REPAIR_DATA = {
  iphone: [
    { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', image: 'IphoneCatItem.webp' },
    { id: 'iphone-16-pro', name: 'iPhone 16 Pro', image: 'IphoneCatItem.webp' },
    { id: 'iphone-16', name: 'iPhone 16', image: 'IphoneCatItem.webp' },
    { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', image: 'IphoneCatItem.webp' },
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro', image: 'IphoneCatItem.webp' },
    { id: 'iphone-15', name: 'iPhone 15', image: 'IphoneCatItem.webp' },
    { id: 'iphone-14-pro', name: 'iPhone 14 Pro', image: 'IphoneCatItem.webp' },
    { id: 'iphone-14', name: 'iPhone 14', image: 'IphoneCatItem.webp' },
    { id: 'iphone-13-pro', name: 'iPhone 13 Pro', image: 'IphoneCatItem.webp' },
    { id: 'iphone-13', name: 'iPhone 13', image: 'IphoneCatItem.webp' },
    { id: 'iphone-12', name: 'iPhone 12', image: 'IphoneCatItem.webp' },
    { id: 'iphone-11', name: 'iPhone 11', image: 'IphoneCatItem.webp' }
  ],
  ipad: [
    { id: 'ipad-pro-13-m4', name: 'iPad Pro 13" M4', image: 'AppleIpad.webp' },
    { id: 'ipad-air-11-m2', name: 'iPad Air 11" M2', image: 'AppleIpad.webp' },
    { id: 'ipad-mini-6', name: 'iPad Mini 6', image: 'AppleIpad.webp' }
  ],
  'apple-watch': [
    { id: 'watch-ultra-2', name: 'Apple Watch Ultra 2', image: 'WatchAppleCatItem.webp' },
    { id: 'watch-series-10', name: 'Apple Watch Series 10', image: 'WatchAppleCatItem.webp' },
    { id: 'watch-se-2', name: 'Apple Watch SE 2', image: 'WatchAppleCatItem.webp' }
  ],
  mac: [
    { id: 'macbook-pro-16-m3', name: 'MacBook Pro 16" M3', image: 'MacBookApple.webp' },
    { id: 'macbook-pro-14-m3', name: 'MacBook Pro 14" M3', image: 'MacBookApple.webp' },
    { id: 'macbook-air-15-m3', name: 'MacBook Air 15" M3', image: 'MacBookApple.webp' }
  ],
  'google-pixel': [
    { id: 'pixel-9-pro-xl', name: 'Google Pixel 9 Pro XL', image: 'GooglePhones.webp' },
    { id: 'pixel-9-pro', name: 'Google Pixel 9 Pro', image: 'GooglePhones.webp' },
    { id: 'pixel-9', name: 'Google Pixel 9', image: 'GooglePhones.webp' }
  ],
  'samsung-galaxy': [
    { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', image: 'SamsPhone.webp' },
    { id: 'galaxy-s24-plus', name: 'Galaxy S24+', image: 'SamsPhone.webp' },
    { id: 'galaxy-s23-ultra', name: 'Galaxy S23 Ultra', image: 'SamsPhone.webp' }
  ],
  'xiaomi-poco': [
    { id: 'xiaomi-14-ultra', name: 'Xiaomi 14 Ultra', image: 'XiaomiPhones.webp' },
    { id: 'poco-f6-pro', name: 'POCO F6 Pro', image: 'PocoPhones.webp' }
  ],
  laptops: [
    { id: 'asus-rog-strix', name: 'ASUS ROG Strix', image: 'LaptopsCatItem.webp' },
    { id: 'lenovo-legion-pro', name: 'Lenovo Legion Pro', image: 'LaptopsCatItem.webp' }
  ],
  dyson: [
    { id: 'dyson-v15-detect', name: 'Dyson V15 Detect', image: 'HandVacuums.webp' },
    { id: 'dyson-airwrap-complete', name: 'Dyson Airwrap Complete', image: 'HairHealth.webp' }
  ],
  playstation: [
    { id: 'playstation-5-pro', name: 'PlayStation 5 Pro', image: 'GameConsoleCat.webp' },
    { id: 'playstation-5-slim', name: 'PlayStation 5 Slim', image: 'GameConsoleCat.webp' }
  ],
  'robot-vacuums': [
    { id: 'roborock-s8-maxv', name: 'Roborock S8 MaxV Ultra', image: 'VacuumsRobo.webp' },
    { id: 'dreame-l20-ultra', name: 'Dreame L20 Ultra', image: 'VacuumsRobo.webp' }
  ],
  'power-stations': [
    { id: 'ecoflow-delta-2', name: 'EcoFlow DELTA 2', image: 'PowerRepair.png' },
    { id: 'bluetti-eb3a', name: 'BLUETTI EB3A', image: 'PowerRepair.png' }
  ]
};

const COMMON_SERVICES = [
  { title: 'Display Replacement', price: 140, icon: '📱' },
  { title: 'Battery Replacement', price: 45, icon: '🔋' },
  { title: 'Back Glass Repair', price: 60, icon: '🪞' },
  { title: 'Charging Port Repair', price: 35, icon: '⚡' },
  { title: 'Camera Module Repair', price: 85, icon: '📷' },
  { title: 'Speaker Cleaning & Fix', price: 25, icon: '🔊' },
  { title: 'Hardware Diagnostics', price: 15, icon: '🔍' },
  { title: 'Liquid Damage Restoration', price: 50, icon: '💧' }
];

router.get('/devices', (req, res) => {
  const { category = 'iphone', page = 1, limit = 12 } = req.query;
  const list = REPAIR_DATA[category] || REPAIR_DATA['iphone'];
  const p = parseInt(page);
  const l = parseInt(limit);
  const start = (p - 1) * l;
  const devices = list.slice(start, start + l);

  res.json({ devices, total: list.length });
});

router.get('/devices/:id/repairs', (req, res) => {
  const { id } = req.params;
  let foundDevice = null;
  let categoryKey = 'iphone';

  for (const [cat, devices] of Object.entries(REPAIR_DATA)) {
    const dev = devices.find(d => d.id === id);
    if (dev) {
      foundDevice = dev;
      categoryKey = cat;
      break;
    }
  }

  if (!foundDevice) {
    foundDevice = { id, name: id.replace(/-/g, ' ').toUpperCase(), image: 'placeholderImg.png' };
  }

  res.json({
    ...foundDevice,
    categoryTitle: categoryKey.replace(/-/g, ' ').toUpperCase(),
    services: COMMON_SERVICES
  });
});