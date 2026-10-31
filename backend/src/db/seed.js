import { connectDB } from './index.js';
import { Product } from '../models/Product.js';

const createSlug = (text, id) => {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${id}`
  );
};

const mapCategory = (item) => {
  const title = (item.title || '').toLowerCase();
  const brand = (item.brand || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  if (brand.includes('apple') || title.includes('iphone') || title.includes('macbook') || title.includes('ipad')) {
    return 'apple';
  }
  if (cat === 'smartphones') return 'smartphones';
  if (cat === 'laptops') return 'laptops';
  if (cat === 'tablets') return 'tablets';
  if (cat === 'mens-watches' || cat === 'womens-watches' || title.includes('watch')) return 'watchs';
  if (cat === 'kitchen-accessories') return 'kitchen-appliances';
  if (cat === 'home-decoration' || cat === 'furniture') return 'home-appliances';
  if (cat === 'beauty' || cat === 'skin-care' || cat === 'fragrances') return 'health';
  if (cat === 'mobile-accessories') return 'apple';
  return 'other';
};

const generateDummySpecs = (item, cat) => {
  const brand = item.brand || 'Universal';
  const title = item.title || '';

  if (cat === 'apple' || cat === 'smartphones') {
    return {
      Device: 'Smartphone',
      Model: brand + ' ' + title.split(' ')[0],
      'Screen Size': title.includes('Max') || title.includes('Plus') || title.includes('Ultra') ? '6.7"' : '6.1"',
      Storage: title.includes('512') ? '512GB' : title.includes('256') ? '256GB' : '128GB',
      RAM: title.includes('Ultra') || title.includes('Pro') ? '12GB' : '8GB',
      'SIM Card Format': title.includes('Pro') ? 'Physical SIM + eSIM' : 'eSIM',
      Color: title.includes('Gold') ? 'Gold' : title.includes('White') ? 'Silver' : title.includes('Blue') ? 'Deep Blue' : 'Space Gray',
      Version: title.includes('Ultra') || title.includes('Pro') ? 'Global' : 'US Version'
    };
  }

  if (cat === 'laptops') {
    return {
      Device: 'Laptop',
      Model: title.split(' ').slice(0, 3).join(' '),
      'Screen Size': title.includes('16') ? '16"' : title.includes('14') ? '14"' : '15.6"',
      Storage: '512GB',
      RAM: '16GB',
      Color: 'Space Gray',
      Version: 'Global'
    };
  }

  if (cat === 'tablets') {
    return {
      Device: 'Tablet',
      Model: title,
      'Screen Size': '10.9"',
      Storage: '128GB',
      RAM: '8GB',
      'SIM Card Format': title.includes('Pro') ? 'eSIM' : 'Physical SIM',
      Color: 'Silver',
      Version: 'Wi-Fi'
    };
  }

  if (cat === 'watchs') {
    return {
      Device: 'Smart Watch',
      Model: title,
      'Screen Size': '1.4"',
      Storage: '32GB',
      RAM: '2GB',
      'SIM Card Format': 'eSIM',
      Color: 'Midnight',
      Version: 'LTE + GPS'
    };
  }

  return {
    Device: cat.replace('-', ' '),
    Model: title,
    Color: 'Standard',
    Version: 'Official'
  };
};

const generateDynamicAddons = (price) => {
  const warrantyPrice = Math.max(19, Math.round(price * 0.08));
  const setupPrice = 25;
  return [
    { title: 'Extended 1-Year Guarantee', price: warrantyPrice },
    { title: 'Full Device Setup & Protection Glass', price: setupPrice }
  ];
};

const generateDynamicOptions = (specs) => {
  const options = [];
  if (specs.Storage) {
    options.push({
      label: 'Storage',
      values: ['128GB', '256GB', '512GB'],
      active: specs.Storage
    });
  }
  if (specs.RAM) {
    options.push({
      label: 'RAM',
      values: ['8GB', '16GB'],
      active: specs.RAM
    });
  }
  if (specs.Version) {
    options.push({
      label: 'Version',
      values: ['Global', 'Official Warranty'],
      active: specs.Version
    });
  }
  return options;
};

const generateDynamicFeatures = (specs) => {
  return [
    { icon: '📱', label: specs['Screen Size'] ? `${specs['Screen Size']} Display` : 'Premium Build' },
    { icon: '⚡', label: specs.Storage ? `${specs.Storage} Fast Drive` : 'High Performance' },
    { icon: '🔋', label: 'All-Day Battery' },
    { icon: '🛡️', label: '1-Year Warranty' }
  ];
};

const extraProducts = [
  {
    slug: 'sony-playstation-5-pro-console-901',
    name: 'Sony PlayStation 5 Pro 2TB Digital Edition',
    price: 799,
    old_price: 849,
    discount_label: '-50 $',
    main_image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews_count: 2,
    stock_status: 'In Stock',
    category: 'consoles',
    description: 'Next-generation PlayStation console featuring high-frame-rate 4K gameplay and ray tracing.',
    specs: {
      Device: 'Game Console',
      Model: 'PlayStation 5 Pro',
      Storage: '2TB',
      RAM: '16GB',
      Color: 'White',
      Version: 'Digital Edition'
    },
    reviews: [
      {
        author: 'Alex Carter',
        rating: 5,
        text: 'Incredible graphics fidelity and silent fan operation even under heavy load.',
        date: '2025-02-10'
      }
    ],
    options: [
      { label: 'Edition', values: ['Digital Edition', 'Disc Edition'], active: 'Digital Edition' },
      { label: 'Storage', values: ['1TB', '2TB'], active: '2TB' }
    ],
    addons: [
      { title: 'Additional DualSense Controller', price: 69 },
      { title: 'PlayStation Plus 12-Month Card', price: 79 }
    ],
    features: [
      { icon: '🎮', label: 'DualSense Haptics' },
      { icon: '⚡', label: '2TB Custom SSD' },
      { icon: '✨', label: 'PSSR 4K Upscaling' },
      { icon: '🛡️', label: 'Sony Official Guarantee' }
    ]
  },
  {
    slug: 'microsoft-xbox-series-x-902',
    name: 'Microsoft Xbox Series X 1TB Console',
    price: 499,
    main_image: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews_count: 1,
    stock_status: 'In Stock',
    category: 'consoles',
    description: 'High performance gaming console engineered for fast load speeds and up to 120 FPS.',
    specs: {
      Device: 'Game Console',
      Model: 'Xbox Series X',
      Storage: '1TB',
      RAM: '16GB',
      Color: 'Matte Black',
      Version: 'Disc Edition'
    },
    reviews: [
      {
        author: 'David L.',
        rating: 5,
        text: 'Game Pass makes this console an unbelievable value.',
        date: '2025-02-01'
      }
    ],
    options: [
      { label: 'Storage', values: ['1TB', '2TB'], active: '1TB' }
    ],
    addons: [
      { title: 'Xbox Wireless Controller', price: 59 },
      { title: 'Game Pass Ultimate 3 Months', price: 44 }
    ],
    features: [
      { icon: '🎮', label: '12 Teraflops GPU' },
      { icon: '⚡', label: 'Quick Resume' },
      { icon: '✨', label: 'True 4K Gaming' },
      { icon: '🛡️', label: 'Microsoft Warranty' }
    ]
  },
  {
    slug: 'nintendo-switch-oled-white-903',
    name: 'Nintendo Switch OLED Model with White Joy-Con',
    price: 349,
    old_price: 379,
    discount_label: '-30 $',
    main_image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews_count: 0,
    stock_status: 'In Stock',
    category: 'consoles',
    description: 'Versatile hybrid system with vibrant 7-inch OLED screen and enhanced audio.',
    specs: {
      Device: 'Handheld Console',
      Model: 'Switch OLED',
      'Screen Size': '7.0"',
      Storage: '64GB',
      RAM: '4GB',
      Color: 'White',
      Version: 'Global'
    },
    reviews: [],
    options: [
      { label: 'Color', values: ['White', 'Neon Red/Blue'], active: 'White' }
    ],
    addons: [
      { title: 'Protective Carrying Case', price: 19 },
      { title: 'Tempered Glass Screen Protector', price: 12 }
    ],
    features: [
      { icon: '📱', label: '7-inch OLED Screen' },
      { icon: '⚡', label: '64GB Storage' },
      { icon: '🔋', label: 'Wide Adjustable Stand' },
      { icon: '🛡️', label: 'Official Warranty' }
    ]
  },
  {
    slug: 'samsung-65-inch-oled-4k-tv-905',
    name: 'Samsung 65" OLED 4K Smart TV',
    price: 1699,
    old_price: 1899,
    discount_label: '-200 $',
    main_image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews_count: 1,
    stock_status: 'In Stock',
    category: 'televisions',
    description: 'OLED smart television delivering pure blacks, billion colors, and Dolby Atmos support.',
    specs: {
      Device: 'Television',
      Model: 'OLED S90D',
      'Screen Size': '65"',
      Color: 'Silver',
      Version: 'Smart TV'
    },
    reviews: [
      {
        author: 'Jonathan K.',
        rating: 5,
        text: 'Picture quality is breathtaking in HDR movies.',
        date: '2025-01-14'
      }
    ],
    options: [
      { label: 'Screen Diagonal', values: ['55"', '65"', '77"'], active: '65"' }
    ],
    addons: [
      { title: 'Wall Mount Bracket with Installation', price: 65 },
      { title: 'HDMI 2.1 Ultra High Speed Cable', price: 25 }
    ],
    features: [
      { icon: '📺', label: '4K OLED 144Hz' },
      { icon: '✨', label: 'Neural Quantum 4K' },
      { icon: '🔊', label: 'Dolby Atmos Audio' },
      { icon: '🛡️', label: '2-Year Official Warranty' }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany({});

    const response = await fetch('https://dummyjson.com/products?limit=0');
    const data = await response.json();

    const dummyProducts = data.products
      .map((item) => {
        const assignedCategory = mapCategory(item);
        if (assignedCategory === 'other') return null;

        let oldPrice = null;
        let discountLabel = null;

        if (item.discountPercentage && item.discountPercentage > 8) {
          oldPrice = Math.round(item.price * (1 + item.discountPercentage / 100));
          discountLabel = `-${Math.round(item.discountPercentage)}%`;
        }

        const generatedSpecs = generateDummySpecs(item, assignedCategory);
        const dynamicAddons = generateDynamicAddons(item.price);
        const dynamicOptions = generateDynamicOptions(generatedSpecs);
        const dynamicFeatures = generateDynamicFeatures(generatedSpecs);

        const mappedReviews = Array.isArray(item.reviews)
          ? item.reviews.map(r => ({
              author: r.reviewerName || 'Anonymous',
              rating: r.rating || 5,
              text: r.comment || '',
              date: (r.date || '').slice(0, 10)
            }))
          : [];

        return {
          slug: createSlug(item.title, item.id),
          name: item.title,
          price: Math.round(item.price),
          old_price: oldPrice,
          discount_label: discountLabel,
          category: assignedCategory,
          description: item.description,
          main_image: item.thumbnail,
          rating: item.rating,
          reviews_count: mappedReviews.length,
          stock_status: item.stock && item.stock > 0 ? 'In Stock' : 'Pre-order',
          specs: generatedSpecs,
          reviews: mappedReviews,
          options: dynamicOptions,
          addons: dynamicAddons,
          features: dynamicFeatures
        };
      })
      .filter(Boolean);

    const allProducts = [...dummyProducts, ...extraProducts];

    await Product.insertMany(allProducts);
    console.log(`Database seeded with ${allProducts.length} authentic products.`);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit();
  }
};

seedDB();