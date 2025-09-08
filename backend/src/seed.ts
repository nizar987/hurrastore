import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storeonline.com' },
    update: {},
    create: {
      email: 'admin@storeonline.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@storeonline.com' },
    update: {},
    create: {
      email: 'customer@storeonline.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  });

  // Create sample products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 99.99,
      category: 'Electronics',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    },
    {
      name: 'Smart Fitness Watch',
      description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.',
      price: 199.99,
      category: 'Electronics',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    },
    {
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
      price: 24.99,
      category: 'Clothing',
      stock: 100,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: 'Keep your drinks cold or hot for hours with this insulated stainless steel bottle.',
      price: 29.99,
      category: 'Home & Kitchen',
      stock: 75,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    },
    {
      name: 'Wireless Charging Pad',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
      price: 39.99,
      category: 'Electronics',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
    },
    {
      name: 'Leather Wallet',
      description: 'Premium genuine leather wallet with RFID blocking technology.',
      price: 49.99,
      category: 'Accessories',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design.',
      price: 79.99,
      category: 'Electronics',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    },
    {
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat made from eco-friendly materials with carrying strap.',
      price: 34.99,
      category: 'Sports & Fitness',
      stock: 80,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@storeonline.com / admin123');
  console.log('Customer user: customer@storeonline.com / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
