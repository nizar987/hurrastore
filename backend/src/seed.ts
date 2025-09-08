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
    // Electronics
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
      name: 'Wireless Charging Pad',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
      price: 39.99,
      category: 'Electronics',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
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
      name: 'Gaming Mechanical Keyboard',
      description: 'RGB backlit mechanical keyboard with customizable keys and anti-ghosting technology.',
      price: 129.99,
      category: 'Electronics',
      stock: 35,
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    },
    {
      name: '4K Ultra HD Monitor',
      description: '27-inch 4K monitor with HDR support and 99% sRGB color accuracy.',
      price: 299.99,
      category: 'Electronics',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    },
    {
      name: 'Wireless Gaming Mouse',
      description: 'High-precision wireless gaming mouse with customizable RGB lighting.',
      price: 89.99,
      category: 'Electronics',
      stock: 45,
      image: 'https://images.unsplash.com/photo-1527864550417-7f8164c55390?w=400',
    },

    // Clothing
    {
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
      price: 24.99,
      category: 'Clothing',
      stock: 100,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    },
    {
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans made from premium cotton blend.',
      price: 59.99,
      category: 'Clothing',
      stock: 75,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    },
    {
      name: 'Hooded Sweatshirt',
      description: 'Comfortable hooded sweatshirt perfect for casual wear.',
      price: 44.99,
      category: 'Clothing',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    },
    {
      name: 'Running Sneakers',
      description: 'Lightweight running shoes with breathable mesh upper.',
      price: 89.99,
      category: 'Clothing',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    },
    {
      name: 'Leather Jacket',
      description: 'Premium genuine leather jacket with classic biker style.',
      price: 199.99,
      category: 'Clothing',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    },
    {
      name: 'Summer Dress',
      description: 'Elegant summer dress perfect for casual and formal occasions.',
      price: 69.99,
      category: 'Clothing',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
    },

    // Home & Kitchen
    {
      name: 'Stainless Steel Water Bottle',
      description: 'Keep your drinks cold or hot for hours with this insulated stainless steel bottle.',
      price: 29.99,
      category: 'Home & Kitchen',
      stock: 75,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    },
    {
      name: 'Coffee Maker',
      description: 'Automatic drip coffee maker with programmable timer and thermal carafe.',
      price: 79.99,
      category: 'Home & Kitchen',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    },
    {
      name: 'Air Fryer',
      description: 'Healthy cooking with less oil using this digital air fryer.',
      price: 129.99,
      category: 'Home & Kitchen',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    },
    {
      name: 'Blender',
      description: 'High-speed blender perfect for smoothies, soups, and sauces.',
      price: 89.99,
      category: 'Home & Kitchen',
      stock: 35,
      image: 'https://images.unsplash.com/photo-1585515656519-4b0b3b4b0b3b?w=400',
    },
    {
      name: 'Ceramic Dinner Set',
      description: 'Complete 16-piece ceramic dinner set for 4 people.',
      price: 149.99,
      category: 'Home & Kitchen',
      stock: 15,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    },

    // Accessories
    {
      name: 'Leather Wallet',
      description: 'Premium genuine leather wallet with RFID blocking technology.',
      price: 49.99,
      category: 'Accessories',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    },
    {
      name: 'Sunglasses',
      description: 'UV protection sunglasses with polarized lenses and stylish frame.',
      price: 79.99,
      category: 'Accessories',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    },
    {
      name: 'Smartphone Case',
      description: 'Protective smartphone case with shock absorption and wireless charging support.',
      price: 24.99,
      category: 'Accessories',
      stock: 80,
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
    },
    {
      name: 'Backpack',
      description: 'Durable laptop backpack with multiple compartments and USB charging port.',
      price: 89.99,
      category: 'Accessories',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    },
    {
      name: 'Watch',
      description: 'Classic analog watch with leather strap and water resistance.',
      price: 159.99,
      category: 'Accessories',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    },

    // Sports & Fitness
    {
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat made from eco-friendly materials with carrying strap.',
      price: 34.99,
      category: 'Sports & Fitness',
      stock: 80,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    },
    {
      name: 'Dumbbells Set',
      description: 'Adjustable dumbbells set with multiple weight options for home workouts.',
      price: 199.99,
      category: 'Sports & Fitness',
      stock: 15,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    },
    {
      name: 'Resistance Bands',
      description: 'Set of resistance bands with different resistance levels for full-body workouts.',
      price: 29.99,
      category: 'Sports & Fitness',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    },
    {
      name: 'Jump Rope',
      description: 'Professional speed jump rope with adjustable length and comfortable handles.',
      price: 19.99,
      category: 'Sports & Fitness',
      stock: 60,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    },
    {
      name: 'Protein Shaker',
      description: 'BPA-free protein shaker bottle with mixing ball for smooth protein drinks.',
      price: 14.99,
      category: 'Sports & Fitness',
      stock: 70,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    },

    // Beauty & Personal Care
    {
      name: 'Skincare Set',
      description: 'Complete skincare routine set with cleanser, toner, and moisturizer.',
      price: 79.99,
      category: 'Beauty & Personal Care',
      stock: 40,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    },
    {
      name: 'Hair Dryer',
      description: 'Professional hair dryer with ionic technology and multiple heat settings.',
      price: 89.99,
      category: 'Beauty & Personal Care',
      stock: 25,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    },
    {
      name: 'Makeup Brush Set',
      description: 'Professional makeup brush set with soft synthetic bristles.',
      price: 39.99,
      category: 'Beauty & Personal Care',
      stock: 35,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    },
    {
      name: 'Electric Toothbrush',
      description: 'Rechargeable electric toothbrush with multiple cleaning modes.',
      price: 69.99,
      category: 'Beauty & Personal Care',
      stock: 30,
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
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
