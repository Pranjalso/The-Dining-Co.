const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://pranjalsoni484_db_user:VEdZAn9RiV4sAT1O@cluster0.qwmuqhs.mongodb.net/';

const menuItems = [
  // ─── BURGER ───
  {
    name: "Classic Burger",
    price: 70,
    category: "Burger",
    description: "Crispy seasoned golden vegetable patty layered with fresh lettuce, juicy tomato slices, crunchy onions, and signature burger cream in a soft toasted bun.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons & Extras",
        minSelect: 0,
        maxSelect: 3,
        options: [
          { name: "Extra Cheese Slice", price: 20 },
          { name: "Double Patty", price: 35 },
          { name: "Chipotle Dip", price: 20 },
          { name: "Cheese & Jalapeño Dip", price: 20 }
        ]
      },
      {
        name: "Spice Level",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Mild", price: 0 },
          { name: "Medium Spicy", price: 0 },
          { name: "Extra Spicy", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Ignite Special Burger",
    price: 100,
    category: "Burger",
    description: "Chef's gourmet jumbo burger packed with a spiced herb-infused patty, melted cheddar cheese, caramelised onions, pickled gherkins, and fiery house ignite sauce.",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons & Extras",
        minSelect: 0,
        maxSelect: 3,
        options: [
          { name: "Extra Cheese Slice", price: 20 },
          { name: "Peri Peri Fries On Side", price: 40 },
          { name: "Cheese & Jalapeño Dip", price: 20 },
          { name: "Chipotle Dip", price: 20 }
        ]
      }
    ]
  },
  {
    name: "Paneer Burger",
    price: 90,
    category: "Burger",
    description: "Thick slab of fresh marinated cottage cheese grilled to golden perfection, dressed with tandoori mayo, crisp veggies, and spiced mint glaze in a sesame bun.",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons & Extras",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Cheese Slice", price: 20 },
          { name: "Extra Jalapeños", price: 15 },
          { name: "Cheese & Jalapeño Dip", price: 20 }
        ]
      }
    ]
  },

  // ─── SANDWICH ───
  {
    name: "Veg Sandwich",
    price: 70,
    category: "Sandwich",
    description: "Classic golden-grilled sandwich loaded with fresh garden cucumber, bell peppers, tomatoes, and spiced Bombay green chutney between buttered crusty bread.",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Customizations",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Cheese Melt", price: 20 },
          { name: "Cheese & Jalapeño Dip", price: 20 },
          { name: "Extra Toasted & Crispy", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Paneer Veg Sandwich",
    price: 90,
    category: "Sandwich",
    description: "Soft succulent paneer cubes tossed in house spices, blended with crunchy bell peppers, diced onions, and melted mozzarella, pressed golden on the grill.",
    imageUrl: "https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons & Dips",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Paneer", price: 30 },
          { name: "Extra Cheese Melt", price: 20 },
          { name: "Chipotle Dip", price: 20 }
        ]
      }
    ]
  },
  {
    name: "Loaded Sandwich",
    price: 120,
    category: "Sandwich",
    description: "Triple-layer supreme club sandwich loaded with seasoned paneer, sweet corn, melted mozzarella, capsicum, and smoky chipotle mayo grilled to perfection.",
    imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Mozzarella", price: 25 },
          { name: "Peri Peri Seasoning", price: 10 },
          { name: "Cheese & Jalapeño Dip", price: 20 }
        ]
      }
    ]
  },

  // ─── FRIES & SNACKS ───
  {
    name: "Peri Peri Fries",
    price: 40,
    category: "Fries & Snacks",
    description: "Crispy skin-on golden potato fries tossed generously in fiery, tangy African peri-peri seasoning. Served piping hot.",
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Pair with a Dip",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Chipotle Dip", price: 20 },
          { name: "Cheese & Jalapeño Dip", price: 20 }
        ]
      }
    ]
  },
  {
    name: "Loaded Fries",
    price: 60,
    category: "Fries & Snacks",
    description: "Crunchy golden fries smothered in velvety warm cheddar cheese sauce, spicy salsa, sliced jalapeños, and Italian herbs.",
    imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Extras",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Cheese Drizzle", price: 20 },
          { name: "Extra Jalapeño Rings", price: 15 },
          { name: "Chipotle Dip", price: 20 }
        ]
      }
    ]
  },
  {
    name: "Honey Chilli Potato",
    price: 70,
    category: "Fries & Snacks",
    description: "Crispy wok-fried potato fingers tossed in a luscious sweet, tangy, and mildly spicy honey chilli reduction with sesame seeds and fresh scallions.",
    imageUrl: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Spice Adjustment",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Extra Spicy", price: 0 },
          { name: "Mild Sweet", price: 0 }
        ]
      }
    ]
  },

  // ─── NOODLES ───
  {
    name: "Hakka Noodles",
    price: 70,
    category: "Noodles",
    description: "Classic Indo-Chinese wok-tossed Hakka noodles with crisp shredded cabbage, carrots, bell peppers, scallions, and light aromatic soy sauce.",
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Add Fresh Paneer", price: 25 },
          { name: "Schezwan Toss (Spicy)", price: 15 },
          { name: "Extra Veggies", price: 15 }
        ]
      }
    ]
  },
  {
    name: "Veg Noodles",
    price: 80,
    category: "Noodles",
    description: "Spicy street-style vegetable noodles packed with stir-fried capsicum, onions, shredded cabbage, fresh ginger-garlic, and spicy dark sauces.",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Add Fresh Paneer", price: 25 },
          { name: "Extra Spicy Chilli Garlic Oil", price: 10 },
          { name: "Extra Crunchy Veggies", price: 15 }
        ]
      }
    ]
  },

  // ─── MOJITO FLAVOURS ───
  {
    name: "Mint Mojito",
    price: 70,
    category: "Mojitos",
    description: "Hand-muddled fresh garden mint leaves, zesty Persian lime wedges, and pure cane sugar topped with chilled sparkling club soda.",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Serving Preference",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Less Sweet", price: 0 },
          { name: "Extra Mint & Lime", price: 10 },
          { name: "Add Basil Seeds (Sabja)", price: 15 }
        ]
      }
    ]
  },
  {
    name: "Watermelon Mojito",
    price: 80,
    category: "Mojitos",
    description: "Sweet ruby-red fresh watermelon juice crushed with cool mint, lime wedges, and sparkling soda over crushed ice. Ultimate summer refresher.",
    imageUrl: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Chilled Ice", price: 0 },
          { name: "Add Basil Seeds (Sabja)", price: 15 }
        ]
      }
    ]
  },
  {
    name: "Green Apple Mojito",
    price: 80,
    category: "Mojitos",
    description: "Crisp tart green apple syrup muddled with mint leaves, lemon wedges, and effervescent fizz for a refreshing sweet-and-sour kick.",
    imageUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Extra Mint & Lemon", price: 10 },
          { name: "Less Sweet", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Blueberry Mojito",
    price: 80,
    category: "Mojitos",
    description: "Luscious mountain blueberry fruit puree blended with garden mint, fresh lime, and chilled bubbly club soda. Bursting with berry aroma.",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Add-ons",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Add Basil Seeds (Sabja)", price: 15 },
          { name: "Less Sweet", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Bubble Gum Mojito",
    price: 80,
    category: "Mojitos",
    description: "Fun, vibrant nostalgic bubblegum syrup muddled with fresh mint, lime, and sparkling soda. A crowd-favorite playful treat.",
    imageUrl: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Serving Preference",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Extra Chilled", price: 0 },
          { name: "Less Sweet", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Spicy Mango Mojito",
    price: 80,
    category: "Mojitos",
    description: "Tropical Alphonso mango pulp balanced with a gentle hint of red chilli flakes, mint, lemon, and fizz for an exhilarating sweet-and-spicy burst.",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Spice Kick",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Extra Chilli Salt Rim", price: 10 },
          { name: "Mild Spice", price: 0 }
        ]
      }
    ]
  },

  // ─── CHAI & COFFEE ───
  {
    name: "Tea",
    price: 12,
    category: "Chai & Coffee",
    description: "Classic Indian milk tea brewed freshly with crushed ginger, whole green cardamom, and premium Assam tea leaves.",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Customization",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Adrak (Extra Ginger)", price: 0 },
          { name: "Less Sugar", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Kulhad Chai",
    price: 15,
    category: "Chai & Coffee",
    description: "Aromatic slow-simmered kadak masala chai served in an authentic earthen clay kulhad for a rich, rustic, and smoky fragrance.",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Chai Spices",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Elaichi (Cardamom)", price: 5 },
          { name: "Extra Kadak", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Gud Tea",
    price: 20,
    category: "Chai & Coffee",
    description: "Wholesome, healthy desi chai naturally sweetened with organic jaggery (gud) and spiced with aromatic winter herbs.",
    imageUrl: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Flavor",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Extra Ginger & Clove", price: 5 },
          { name: "Medium Sweetness", price: 0 }
        ]
      }
    ]
  },
  {
    name: "Cold Coffee",
    price: 70,
    category: "Chai & Coffee",
    description: "Thick, creamy chilled blended milk coffee topped with airy coffee foam, chocolate syrup swirls, and cocoa sprinkles.",
    imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Toppings & Flavors",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Vanilla Ice Cream Scoop", price: 30 },
          { name: "Extra Chocolate Drizzle", price: 15 },
          { name: "Hazelnut Flavor Shot", price: 20 }
        ]
      }
    ]
  },
  {
    name: "Hot Coffee",
    price: 30,
    category: "Chai & Coffee",
    description: "Frothy, steaming hot cappuccino-style whipped milk coffee with a delicate dusting of premium cocoa powder.",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Coffee Strength",
        minSelect: 0,
        maxSelect: 1,
        options: [
          { name: "Extra Strong Shot", price: 0 },
          { name: "Hazelnut Flavor", price: 15 }
        ]
      }
    ]
  },

  // ─── WRAP ───
  {
    name: "Classic Veg Wrap",
    price: 90,
    category: "Wrap",
    description: "Soft warm tortilla wrapped around a spiced vegetable cutlet, crunchy shredded cabbage, capsicum, onions, and tangy mint mayo.",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Wrap Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Cheese Melt", price: 20 },
          { name: "Chipotle Dip", price: 20 },
          { name: "Schezwan Drizzle", price: 10 }
        ]
      }
    ]
  },
  {
    name: "Bombay Aloo Wrap",
    price: 100,
    category: "Wrap",
    description: "Street-style spiced Bombay potato masala wrapped with sweet tamarind chutney, spicy coriander chutney, onions, and crispy sev.",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Wrap Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Cheese Melt", price: 20 },
          { name: "Cheese & Jalapeño Dip", price: 20 }
        ]
      }
    ]
  },
  {
    name: "Classic Paneer Wrap",
    price: 120,
    category: "Wrap",
    description: "Smoky tandoori marinated paneer batons wrapped with crisp bell peppers, caramelised onions, and garlic-herb cream sauce in a soft roll.",
    imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        name: "Wrap Add-ons",
        minSelect: 0,
        maxSelect: 2,
        options: [
          { name: "Extra Paneer", price: 30 },
          { name: "Extra Cheese Melt", price: 20 },
          { name: "Chipotle Dip", price: 20 }
        ]
      }
    ]
  },

  // ─── DIP ───
  {
    name: "Chipotle Dip",
    price: 20,
    category: "Dip",
    description: "Smoky, creamy Mexican chipotle pepper dip with subtle heat. Perfect pairing with crispy peri peri and loaded fries.",
    imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop",
    isAvailable: true
  },
  {
    name: "Cheese & Jalapeño Dip",
    price: 20,
    category: "Dip",
    description: "Velvety melted cheese dip infused with zesty pickled jalapeño bits. Ideal pairing for burgers, grilled sandwiches, and fries.",
    imageUrl: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&auto=format&fit=crop",
    isAvailable: true
  }
];

async function seed() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const cafeSlug = "ignite-aeros";

  // Clean existing items for ignite-aeros
  await db.collection("menuitems").deleteMany({ cafeSlug });
  console.log(`Cleared old items for ${cafeSlug}`);

  const itemsToInsert = menuItems.map(item => ({
    ...item,
    cafeSlug,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const res = await db.collection("menuitems").insertMany(itemsToInsert);
  console.log(`Successfully inserted ${res.insertedCount} menu items for ${cafeSlug} (Ashish Verma)!`);

  // Verify categories
  const categories = await db.collection("menuitems").distinct("category", { cafeSlug });
  console.log("Categories created:", categories);

  process.exit(0);
}

seed().catch(err => {
  console.error("Error seeding menu:", err);
  process.exit(1);
});
