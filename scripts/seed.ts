import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';
import MenuItem from '@/lib/db/models/MenuItem';
import Order from '@/lib/db/models/Order';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    await Admin.deleteMany({});
    await Cafe.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing data');

    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = await Admin.create({
      username: 'superadmin',
      password: hashedPassword,
      role: 'superadmin',
    });

    console.log('Super admin created:', superAdmin.username);

    // Create sample cafes
    const cafes = [
      {
        cafeName: 'Central Perk',
        ownerName: 'Gunther',
        city: 'New York',
        location: '199 Lafayette St, New York',
        subscriptionPlan: '12 Months',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        slug: 'central-perk',
        username: 'central_p',
        password: 'password123',
        isActive: true,
      },
      {
        cafeName: "Luke's Diner",
        ownerName: 'Luke Danes',
        city: 'Stars Hollow',
        location: '45 Main St, Stars Hollow',
        subscriptionPlan: '6 Months',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        slug: 'lukes-diner',
        username: 'lukes_diner',
        password: 'password123',
        isActive: true,
      },
      {
        cafeName: 'The Rose',
        ownerName: 'Moiraine',
        city: 'Tar Valon',
        location: '123 White Tower St',
        subscriptionPlan: 'Demo (7 Days)',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
        slug: 'the-rose',
        username: 'rose_cafe',
        password: 'password123',
        isActive: false,
      },
    ];

    for (const cafeData of cafes) {
      const cafe = await Cafe.create(cafeData);

      // Create cafe admin
      const cafeAdminPassword = await bcrypt.hash(cafeData.password, 10);
      await Admin.create({
        username: cafeData.username,
        password: cafeAdminPassword,
        role: 'cafeadmin',
        cafeSlug: cafe.slug,
      });

      // Create sample menu items
      const menuItems = [
        {
          cafeSlug: cafe.slug,
          name: 'Classic Margherita',
          price: 149,
          category: 'Pizza',
          description: 'Classic Margherita',
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        },
        {
          cafeSlug: cafe.slug,
          name: 'Farm Fresh',
          price: 149,
          category: 'Pizza',
          description: 'Farm Fresh',
          imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
        },
        {
          cafeSlug: cafe.slug,
          name: 'French Fries',
          price: 99,
          category: 'Snacks',
          description: 'Crispy & Golden',
          imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f',
        },
      ];

      await MenuItem.insertMany(menuItems);

      // Create sample orders
      const orders = [
        {
          cafeSlug: cafe.slug,
          orderNumber: 1001,
          tableNumber: '05',
          items: [
            {
              menuItemId: '1',
              name: 'Classic Margherita',
              price: 149,
              quantity: 2,
            },
            {
              menuItemId: '2',
              name: 'Farm Fresh',
              price: 149,
              quantity: 1,
            },
          ],
          subtotal: 447,
          tax: 22,
          total: 469,
          paymentMethod: 'upi',
          paymentStatus: 'completed',
          orderStatus: 'served',
          upiId: 'customer@okhdfcbank',
        },
      ];

      await Order.insertMany(orders);

      console.log(`Cafe created: ${cafe.cafeName}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();