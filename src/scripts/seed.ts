import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<Model<any>>(getModelToken('User'));
  const productModel = app.get<Model<any>>(getModelToken('Product'));
  const loyaltyModel = app.get<Model<any>>(getModelToken('Loyalty'));

  try {
    // Create admin user
    const adminExists = await userModel.findOne({ email: 'admin@shopco.com' });
    if (!adminExists) {
      await userModel.create({
        name: 'Admin User',
        email: 'admin@shopco.com',
        password: process.env.ADMIN_PASSWORD || 'admin123456', // 8+ chars with letters and numbers
        role: 'ADMIN',
        loyaltyPoints: 0
      });
      console.log('Admin user created');
    }

    // Create super admin user
    const superAdminExists = await userModel.findOne({ email: 'superadmin@shopco.com' });
    if (!superAdminExists) {
      await userModel.create({
        name: 'Super Admin',
        email: 'superadmin@shopco.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123', // 8+ chars with letters and numbers
        role: 'SUPER_ADMIN',
        loyaltyPoints: 0
      });
      console.log('Super Admin user created');
    }

    // Create test user
    const userExists = await userModel.findOne({ email: 'user@test.com' });
    if (!userExists) {
      await userModel.create({
        name: 'Test User',
        email: 'user@test.com',
        password: process.env.TEST_USER_PASSWORD || 'user123456', // 8+ chars with letters and numbers
        role: 'USER',
        loyaltyPoints: 1000
      });
      console.log('Test user created');
    }

    // Create loyalty settings
    const loyaltyExists = await loyaltyModel.findOne();
    if (!loyaltyExists) {
      await loyaltyModel.create({
        pointsPerDollar: 10,
        pointsToMoneyRate: 0.1,
        isActive: true
      });
      console.log('Loyalty settings created');
    }

    // Create sample products
    const productsExist = await productModel.countDocuments();
    if (productsExist === 0) {
      const sampleProducts = [
        {
          title: 'Classic White T-Shirt',
          description: 'A comfortable and stylish white t-shirt made from premium cotton.',
          price: 29.99,
          stock: 100,
          images: ['/images/pic1.png'],
          loyaltyType: 'MONEY',
          category: 'T-Shirts',
          tags: ['casual', 'cotton', 'white']
        },
        {
          title: 'Premium Denim Jeans',
          description: 'High-quality denim jeans with a perfect fit.',
          price: 89.99,
          stock: 50,
          images: ['/images/pic2.png'],
          loyaltyType: 'HYBRID',
          loyaltyPointsCost: 900,
          category: 'Jeans',
          tags: ['denim', 'casual', 'blue']
        },
        {
          title: 'Exclusive Loyalty Hoodie',
          description: 'Special hoodie available only with loyalty points.',
          price: 79.99,
          stock: 25,
          images: ['/images/pic3.png'],
          loyaltyType: 'POINTS',
          loyaltyPointsCost: 800,
          category: 'Hoodies',
          tags: ['exclusive', 'loyalty', 'hoodie']
        },
        {
          title: 'Summer Polo Shirt',
          description: 'Lightweight polo shirt perfect for summer.',
          price: 45.99,
          stock: 75,
          images: ['/images/pic4.png'],
          loyaltyType: 'MONEY',
          category: 'Polo',
          tags: ['summer', 'polo', 'lightweight'],
          isOnSale: true,
          salePrice: 35.99
        },
        {
          title: 'Designer Sneakers',
          description: 'Trendy sneakers with premium materials.',
          price: 129.99,
          stock: 30,
          images: ['/images/pic5.png'],
          loyaltyType: 'HYBRID',
          loyaltyPointsCost: 1300,
          category: 'Shoes',
          tags: ['sneakers', 'designer', 'premium']
        },
        {
          title: 'Loyalty Points Jacket',
          description: 'Exclusive jacket available only with points.',
          price: 149.99,
          stock: 15,
          images: ['/images/pic6.png'],
          loyaltyType: 'POINTS',
          loyaltyPointsCost: 1500,
          category: 'Jackets',
          tags: ['exclusive', 'jacket', 'premium']
        }
      ];

      await productModel.insertMany(sampleProducts);
      console.log('Sample products created');
    }

    console.log('Database seeded successfully!');
    console.log('Super Admin credentials: superadmin@shopco.com / [SUPER_ADMIN_PASSWORD]');
    console.log('Admin credentials: admin@shopco.com / [ADMIN_PASSWORD]');
    console.log('User credentials: user@test.com / [TEST_USER_PASSWORD]');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seed();