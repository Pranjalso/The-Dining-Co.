const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env
const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const match = envFile.match(/MONGODB_URI=(.*)/);
if (!match) {
  console.error('No MONGODB_URI found');
  process.exit(1);
}
const MONGODB_URI = match[1].trim().replace(/^['"]|['"]$/g, '');

const CAFE_SLUG = 'ignite-aeros-cafe';
const CAFE_NAME = 'Ignite Aeros Cafe';
const CAFE_USERNAME = 'ignite';
const CAFE_PASSWORD = 'IgniteCafe@2026';
const OWNER_NAME = 'Aeros Team';
const CAFE_EMAIL = 'contact@igniteaeroscafe.com';
const CAFE_PHONE = '9876543210';
const CAFE_CITY = 'Bhopal';
const CAFE_LOCATION = 'Aviation Hub, VIP Road, Bhopal';

const menuItemsData = [
  // --- Artisanal Coffee & Brews ---
  {
    name: 'Aeros Signature Cold Brew',
    price: 180,
    category: 'Coffee & Brews',
    description: '16-hour slow-steeped single-origin Arabica cold brew served over handcrafted ice with citrus notes.',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Ignite Caramel Macchiato',
    price: 190,
    category: 'Coffee & Brews',
    description: 'Freshly steamed milk with vanilla-flavored syrup marked with bold espresso and topped with caramel drizzle.',
    imageUrl: 'https://images.unsplash.com/photo-1485808191629-597e7a83042d?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Classic Velvet Cappuccino',
    price: 150,
    category: 'Coffee & Brews',
    description: 'Rich dark espresso roast layered with equal parts warm milk and silky thick foam, dusted with Belgian cocoa.',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Spanish Cortado',
    price: 160,
    category: 'Coffee & Brews',
    description: 'Equal parts intense double ristretto and warm textured whole milk in an authentic rock glass.',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Iced Hazelnut Frappe',
    price: 210,
    category: 'Coffee & Brews',
    description: 'Blended espresso, roasted hazelnut syrup, chilled milk, and crushed ice crowned with whipped cream.',
    imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // --- Coolers & Refreshers ---
  {
    name: 'Wild Berry Hibiscus Cooler',
    price: 170,
    category: 'Coolers & Refreshers',
    description: 'Brewed ruby-red hibiscus tea infused with wild raspberries, fresh mint leaves, and a dash of lime soda.',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Passionfruit Mint Mojito',
    price: 160,
    category: 'Coolers & Refreshers',
    description: 'Crushed garden mint, freshly squeezed lime, and sweet-tart tropical passionfruit pulp over sparkling soda.',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Blue Aero Ocean Sparkler',
    price: 180,
    category: 'Coolers & Refreshers',
    description: 'Vibrant blue curaçao layered with zesty kaffir lime, sparkling soda, and a touch of organic sugarcane syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // --- Appetizers & Small Bites ---
  {
    name: 'Truffle Parmesan Hand-Cut Fries',
    price: 220,
    category: 'Appetizers & Starters',
    description: 'Crisp russet potato fries tossed in Italian white truffle oil, grated aged parmesan, and cracked pepper with garlic dip.',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Peri-Peri Paneer Popcorn',
    price: 240,
    category: 'Appetizers & Starters',
    description: 'Crispy golden bite-sized cottage cheese crunchies tossed in an aromatic South African peri-peri glaze.',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Cheesy Jalapeño Poppers',
    price: 230,
    category: 'Appetizers & Starters',
    description: 'Melted cheddar, mozzarella, and pickled jalapeños encased in a crunchy crumb, served with salsa and dip.',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Classic Garlic Butter Toasties',
    price: 160,
    category: 'Appetizers & Starters',
    description: 'Crusty artisan baguette brushed with roasted garlic butter, fresh parsley, and melted golden mozzarella.',
    imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // --- Artisanal Pizzas & Pastas ---
  {
    name: 'Ignite Truffle Wild Mushroom Pizza',
    price: 360,
    category: 'Pizzas & Pastas',
    description: 'Thin hand-stretched crust topped with roasted button & shiitake mushrooms, fior di latte, and truffle cream.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Quattro Formaggi Margherita',
    price: 320,
    category: 'Pizzas & Pastas',
    description: 'San Marzano tomato base with fresh mozzarella, bocconcini, smoked scamorza, and sweet basil leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Spicy Arrabbiata Penne',
    price: 290,
    category: 'Pizzas & Pastas',
    description: 'Al dente penne in fiery slow-simmered plum tomato sauce with bird’s eye chillies, black olives, and fresh basil.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Creamy Sundried Tomato & Pesto Fusilli',
    price: 310,
    category: 'Pizzas & Pastas',
    description: 'Handmade basil pesto tossed with cream sauce, sweet sundried tomatoes, roasted pine nuts, and parmesan.',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // --- Gourmet Burgers & Sandwiches ---
  {
    name: 'The Aero Crunch Veggie Burger',
    price: 260,
    category: 'Burgers & Sandwiches',
    description: 'Spiced herb potato & corn patty, melted gouda, crisp lettuce, gherkins, and smoked chipotle sauce in brioche.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Grilled Pesto Panini Sandwich',
    price: 240,
    category: 'Burgers & Sandwiches',
    description: 'Pressed ciabatta stuffed with fresh bocconcini mozzarella, farm tomatoes, and fragrant basil pesto sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // --- Desserts & Bakes ---
  {
    name: 'Belgian Dark Chocolate Fondant',
    price: 220,
    category: 'Desserts & Bakes',
    description: 'Warm, gooey molten-centered 70% dark Belgian chocolate cake served with Madagascar vanilla bean ice cream.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Classic Espresso Tiramisu',
    price: 240,
    category: 'Desserts & Bakes',
    description: 'Layers of espresso-soaked savoiardi ladyfingers and whipped mascarpone cream dusted with Dutch cocoa.',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'New York Baked Berry Cheesecake',
    price: 230,
    category: 'Desserts & Bakes',
    description: 'Silky rich baked cream cheese on a buttery graham crust, topped with house-made mixed blueberry-strawberry compote.',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
];

const offersData = [
  {
    title: 'Welcome to Ignite Aeros — Flat 20% Off',
    description: 'Enjoy 20% discount on your entire first dine-in order across our artisan menu.',
    discountType: 'percentage',
    discountValue: '20% OFF',
    code: 'IGNITE20',
    minOrderAmount: 399,
    badgeText: 'WELCOME OFFER',
    isActive: true,
    applicableItems: [],
    orderIndex: 0,
  },
  {
    title: 'Aero Flight Combo: Coffee + Dessert',
    description: 'Pair any signature hot or iced brew with our famous Belgian chocolate lava cake and save flat ₹100.',
    discountType: 'flat',
    discountValue: '₹100 FLAT',
    code: 'AEROCOMBO',
    minOrderAmount: 350,
    badgeText: 'BEST VALUE COMBO',
    isActive: true,
    applicableItems: [],
    orderIndex: 1,
  },
  {
    title: 'Happy Hours Feast — 15% Off',
    description: 'Special 15% discount on all artisan pizzas, burgers, and cold refreshers.',
    discountType: 'percentage',
    discountValue: '15% OFF',
    code: 'HAPPYFEAST',
    minOrderAmount: 499,
    badgeText: 'POPULAR DEAL',
    isActive: true,
    applicableItems: [],
    orderIndex: 2,
  },
];

async function seedIgniteCafe() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;

    // 1. Check or clean up existing Ignite records
    await db.collection('cafes').deleteMany({ slug: CAFE_SLUG });
    await db.collection('admins').deleteMany({
      $or: [{ username: CAFE_USERNAME }, { cafeSlug: CAFE_SLUG }],
    });
    await db.collection('menuitems').deleteMany({ cafeSlug: CAFE_SLUG });
    await db.collection('offers').deleteMany({ cafeSlug: CAFE_SLUG });
    await db.collection('ratings').deleteMany({ cafeSlug: CAFE_SLUG });

    console.log('Cleaned previous data for:', CAFE_SLUG);

    // 2. Hash password for Admin & Cafe
    const hashedPassword = await bcrypt.hash(CAFE_PASSWORD, 10);

    // 3. Create Cafe document
    const cafeDoc = {
      cafeName: CAFE_NAME,
      ownerName: OWNER_NAME,
      email: CAFE_EMAIL,
      city: CAFE_CITY,
      location: CAFE_LOCATION,
      subscriptionPlan: 'Lifetime',
      startDate: new Date(),
      endDate: new Date('2032-12-31'),
      slug: CAFE_SLUG,
      username: CAFE_USERNAME,
      password: hashedPassword,
      isActive: true,
      tokenVersion: 0,
      contactNumber: CAFE_PHONE,
      taxRate: 5,
      showTax: true,
      upiQrCode: '',
      upiId: 'igniteaeros@upi',
      tables: ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Patio 1', 'Patio 2', 'Lounge VIP'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cafeInsertResult = await db.collection('cafes').insertOne(cafeDoc);
    console.log('Inserted Cafe:', CAFE_NAME, 'with ID:', cafeInsertResult.insertedId);

    // 4. Create Cafe Admin document
    const adminDoc = {
      username: CAFE_USERNAME,
      password: hashedPassword,
      role: 'cafeadmin',
      cafeSlug: CAFE_SLUG,
      tokenVersion: 0,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('admins').insertOne(adminDoc);
    console.log('Inserted Cafe Admin with username:', CAFE_USERNAME);

    // 5. Insert Menu Items
    const formattedMenuItems = menuItemsData.map((item) => ({
      ...item,
      cafeSlug: CAFE_SLUG,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const menuResult = await db.collection('menuitems').insertMany(formattedMenuItems);
    console.log(`Inserted ${menuResult.insertedCount} menu items for ${CAFE_NAME}`);

    // 6. Insert Offers
    const formattedOffers = offersData.map((offer) => ({
      ...offer,
      cafeSlug: CAFE_SLUG,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const offersResult = await db.collection('offers').insertMany(formattedOffers);
    console.log(`Inserted ${offersResult.insertedCount} promotional offers for ${CAFE_NAME}`);

    // 7. Insert Initial Positive Ratings
    const sampleRatings = [
      {
        cafeSlug: CAFE_SLUG,
        rating: 5,
        review: 'Incredible cold brew and truffle fries! The QR ordering experience was super fast and smooth.',
        customerName: 'Rohit Sharma',
        customerPhone: '9823456781',
        createdAt: new Date(),
      },
      {
        cafeSlug: CAFE_SLUG,
        rating: 5,
        review: 'Loved the vibe! The wild mushroom pizza and tiramisu are top tier in town.',
        customerName: 'Ananya Verma',
        customerPhone: '9811223344',
        createdAt: new Date(),
      },
      {
        cafeSlug: CAFE_SLUG,
        rating: 4.8,
        review: 'Great ambiance and prompt service. The aero crunch burger is a must try!',
        customerName: 'Vikramaditya',
        customerPhone: '9922334455',
        createdAt: new Date(),
      },
    ];
    await db.collection('ratings').insertMany(sampleRatings);
    console.log(`Inserted ${sampleRatings.length} customer ratings for ${CAFE_NAME}`);

    console.log('\n--- SETUP COMPLETED SUCCESSFULLY ---');
    console.log('Cafe Slug:', CAFE_SLUG);
    console.log('Cafe Name:', CAFE_NAME);
    console.log('Username:', CAFE_USERNAME);
    console.log('Password:', CAFE_PASSWORD);
    console.log('Menu URL: http://localhost:3000/' + CAFE_SLUG + '/menu');
    console.log('Admin Portal: http://localhost:3000/' + CAFE_SLUG + '/adminlogin');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Ignite Aeros Cafe:', err);
    process.exit(1);
  }
}

seedIgniteCafe();
