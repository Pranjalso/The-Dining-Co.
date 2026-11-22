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

const CAFE_SLUG = 'demo';
const CAFE_NAME = 'Demo Cafe';
const CAFE_USERNAME = 'demo';
const CAFE_PASSWORD = 'Demo@123';
const OWNER_NAME = 'Demo Admin';
const CAFE_EMAIL = 'demo@thediningco.com';
const CAFE_PHONE = '9876543210';
const CAFE_CITY = 'Bhopal';
const CAFE_LOCATION = 'Demo Center, MP Nagar, Bhopal';
const UPI_ID = 'paytmqr1dg7pzq2b8@paytm';
const UPI_QR_URL = 'https://res.cloudinary.com/dehmhdpqn/image/upload/v1795342489/smartdini/demo/ei6fx7bo6hgbivgydbun.jpg';

const demoMenuItems = [
  // ─── Hot Coffee & Brews ───
  {
    name: 'Espresso Single Shot',
    price: 60,
    category: 'Hot Coffee & Brews',
    description: 'Rich, intense, full-bodied shot of 100% Arabica roasted beans with thick golden crema.',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Shot Size',
        minSelect: 1,
        maxSelect: 1,
        options: [
          { name: 'Single Shot', price: 0 },
          { name: 'Double Shot (Doppio)', price: 30 },
        ],
      },
    ],
  },
  {
    name: 'Classic Cappuccino',
    price: 90,
    category: 'Hot Coffee & Brews',
    description: 'Expertly steamed whole milk poured over rich espresso, crowned with velvety thick froth and cocoa dust.',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Milk Choice',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: 'Regular Milk', price: 0 },
          { name: 'Almond Milk', price: 30 },
          { name: 'Oat Milk', price: 35 },
        ],
      },
      {
        name: 'Extra Flavor',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: 'Hazelnut Shot', price: 25 },
          { name: 'Vanilla Shot', price: 25 },
          { name: 'Caramel Drizzle', price: 20 },
        ],
      },
    ],
  },
  {
    name: 'Cafe Latte',
    price: 110,
    category: 'Hot Coffee & Brews',
    description: 'Smooth, comforting blend of espresso with generous steamed milk and delicate micro-foam.',
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Sugar Level',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: 'Regular Sugar', price: 0 },
          { name: 'Less Sugar', price: 0 },
          { name: 'No Sugar', price: 0 },
        ],
      },
    ],
  },
  {
    name: 'Hot Cafe Mocha',
    price: 130,
    category: 'Hot Coffee & Brews',
    description: 'Decadent dark chocolate melted into freshly pulled espresso, velvety milk, and topped with dark chocolate swirls.',
    imageUrl: 'https://images.unsplash.com/photo-1607681034540-2c46cc71896d?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // ─── Cold Coffee & Shakes ───
  {
    name: 'Classic Cold Coffee',
    price: 99,
    category: 'Cold Coffee & Shakes',
    description: 'Thick, creamy and refreshing blended cold coffee made with rich roast beans and ice cream.',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Add-ons',
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: 'Vanilla Ice Cream Scoop', price: 30 },
          { name: 'Chocolate Syrup', price: 15 },
          { name: 'Crushed KitKat', price: 25 },
        ],
      },
    ],
  },
  {
    name: 'Hazelnut Frappe',
    price: 140,
    category: 'Cold Coffee & Shakes',
    description: 'Rich hazelnut praline syrup blended with icy espresso and thick milk, topped with whipped cream.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Belgian Chocolate Shake',
    price: 150,
    category: 'Cold Coffee & Shakes',
    description: 'Rich artisanal Belgian chocolate blended with creamy whole milk and fudge brownies.',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Strawberry Thick Shake',
    price: 130,
    category: 'Cold Coffee & Shakes',
    description: 'Fresh strawberry puree whipped into velvety milk and creamy vanilla ice cream.',
    imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // ─── Burgers & Sandwiches ───
  {
    name: 'Crispy Veg Supreme Burger',
    price: 80,
    category: 'Burgers & Sandwiches',
    description: 'Crispy golden potato and vegetable patty layered with crisp iceberg lettuce, tomato slices, and secret herb mayo.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Extras',
        minSelect: 0,
        maxSelect: 3,
        options: [
          { name: 'Extra Cheese Slice', price: 20 },
          { name: 'Double Patty', price: 35 },
          { name: 'Peri Peri Fries on Side', price: 40 },
        ],
      },
    ],
  },
  {
    name: 'Paneer Tikka Burger',
    price: 120,
    category: 'Burgers & Sandwiches',
    description: 'Tandoori-spiced grilled cottage cheese slab with mint chutney, sliced onions, and melted cheese in a toasted brioche bun.',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Cheese Option',
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: 'Single Cheese', price: 0 },
          { name: 'Double Cheese', price: 25 },
        ],
      },
    ],
  },
  {
    name: 'Grilled Cheese Sandwich',
    price: 100,
    category: 'Burgers & Sandwiches',
    description: 'Gooey mozzarella and sharp cheddar cheese toasted golden brown in artisan bread with garlic butter.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Veg Club Sandwich (Triple Decker)',
    price: 130,
    category: 'Burgers & Sandwiches',
    description: 'Three layers of toasted bread packed with fresh cucumber, tomato, cheese, coleslaw, and herb dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // ─── Pizza & Pasta ───
  {
    name: 'Classic Margherita Pizza (8")',
    price: 160,
    category: 'Pizza & Pasta',
    description: 'Hand-tossed crust with rich San Marzano tomato sauce, fresh buffalo mozzarella, aromatic basil, and olive oil drizzle.',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Crust & Cheese',
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: 'Cheese Burst Crust', price: 50 },
          { name: 'Extra Mozzarella', price: 35 },
          { name: 'Jalapeño & Olives', price: 25 },
        ],
      },
    ],
  },
  {
    name: 'Farmhouse Garden Pizza (8")',
    price: 220,
    category: 'Pizza & Pasta',
    description: 'Loaded with crunchy bell peppers, sweet corn, mushrooms, red onions, black olives, and melted mozzarella.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Crust & Cheese',
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: 'Cheese Burst Crust', price: 50 },
          { name: 'Extra Mozzarella', price: 35 },
        ],
      },
    ],
  },
  {
    name: 'Creamy Alfredo White Pasta',
    price: 180,
    category: 'Pizza & Pasta',
    description: 'Penne pasta tossed in a velvety garlic parmesan cream sauce with sauteed broccoli and sweet corn. Served with garlic toast.',
    imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'Spicy Arrabbiata Red Pasta',
    price: 170,
    category: 'Pizza & Pasta',
    description: 'Penne simmered in a spicy, tangy Italian tomato sauce with garlic, chili flakes, olives, and fresh herbs.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d62816f1?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // ─── Quick Bites & Sides ───
  {
    name: 'Crispy Peri Peri French Fries',
    price: 90,
    category: 'Quick Bites & Sides',
    description: 'Golden, crispy potato fries tossed in zesty African peri peri seasoning. Served with creamy garlic dip.',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop',
    isAvailable: true,
    modifierGroups: [
      {
        name: 'Dip Options',
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: 'Cheesy Jalapeño Dip', price: 20 },
          { name: 'Chipotle Mayo', price: 20 },
        ],
      },
    ],
  },
  {
    name: 'Cheese Garlic Bread (4 pcs)',
    price: 110,
    category: 'Quick Bites & Sides',
    description: 'Toasted French baguette slices rubbed with garlic butter, covered in bubbling melted mozzarella and herbs.',
    imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop',
    isAvailable: true,
  },

  // ─── Desserts ───
  {
    name: 'Warm Sizzling Chocolate Brownie',
    price: 120,
    category: 'Desserts',
    description: 'Warm fudge walnut brownie served with a scoop of premium vanilla bean ice cream and hot chocolate fudge.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
  {
    name: 'New York Style Cheesecake',
    price: 160,
    category: 'Desserts',
    description: 'Classic dense and creamy baked cheesecake on a buttery graham cracker crust with berry coulis.',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop',
    isAvailable: true,
  },
];

async function seedDemoCafe() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // Safety check: ensure ignite-aeros exists and is untouched
    const igniteCheck = await db.collection('cafes').findOne({ slug: 'ignite-aeros' });
    if (!igniteCheck) {
      console.error('CRITICAL: ignite-aeros not found! Aborting for safety.');
      process.exit(1);
    }
    console.log('Verified ignite-aeros cafe is intact in DB.');

    // 1. Hash password for Demo Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(CAFE_PASSWORD, salt);

    // 2. Insert or update Demo Cafe in `cafes`
    const cafeDoc = {
      cafeName: CAFE_NAME,
      ownerName: OWNER_NAME,
      email: CAFE_EMAIL,
      city: CAFE_CITY,
      location: CAFE_LOCATION,
      subscriptionPlan: 'Lifetime',
      startDate: new Date('2026-11-22T00:00:00.000Z'),
      endDate: new Date('2035-12-31T23:59:59.000Z'),
      slug: CAFE_SLUG,
      username: CAFE_USERNAME,
      password: hashedPassword,
      isActive: true,
      tokenVersion: 0,
      contactNumber: CAFE_PHONE,
      taxRate: 0,
      showTax: false,
      upiQrCode: UPI_QR_URL,
      upiId: UPI_ID,
      tables: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      theme: 'warm-beige',
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const cafeResult = await db.collection('cafes').updateOne(
      { slug: CAFE_SLUG },
      { $set: cafeDoc },
      { upsert: true }
    );
    console.log('Demo Cafe upsert result:', cafeResult);

    // 3. Insert or update Demo Admin in `admins`
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

    const adminResult = await db.collection('admins').updateOne(
      { username: CAFE_USERNAME },
      { $set: adminDoc },
      { upsert: true }
    );
    console.log('Demo Admin upsert result:', adminResult);

    // 4. Remove any existing demo menu items before re-seeding
    await db.collection('menuitems').deleteMany({ cafeSlug: CAFE_SLUG });

    // 5. Insert Demo Menu Items
    const formattedMenuItems = demoMenuItems.map((item) => ({
      ...item,
      cafeSlug: CAFE_SLUG,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const menuResult = await db.collection('menuitems').insertMany(formattedMenuItems);
    console.log(`Successfully inserted ${menuResult.insertedCount} menu items for ${CAFE_NAME}`);

    // Verify ignite-aeros remains untouched
    const igniteAfter = await db.collection('cafes').findOne({ slug: 'ignite-aeros' });
    const igniteMenuCount = await db.collection('menuitems').countDocuments({ cafeSlug: 'ignite-aeros' });
    console.log('Post-check ignite-aeros intact:', igniteAfter.slug === 'ignite-aeros', 'Menu count:', igniteMenuCount);

    console.log('\n=========================================');
    console.log('DEMO CAFE SETUP COMPLETED SUCCESSFULLY');
    console.log('Cafe Slug:', CAFE_SLUG);
    console.log('Cafe Name:', CAFE_NAME);
    console.log('Username:', CAFE_USERNAME);
    console.log('Password:', CAFE_PASSWORD);
    console.log('UPI ID:', UPI_ID);
    console.log('UPI QR URL:', UPI_QR_URL);
    console.log('Customer Menu URL: https://the-dining-co.vercel.app/demo/menu?table=1');
    console.log('Admin Portal URL: https://the-dining-co.vercel.app/demo/adminlogin');
    console.log('=========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Demo Cafe:', err);
    process.exit(1);
  }
}

seedDemoCafe();
