const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://jameel:11223344@cluster0.dgwxhjh.mongodb.net/Loyalty-Point-E-com';

async function updateStock() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected!');

    const result = await mongoose.connection.collection('products').updateMany({}, { $set: { stock: 1000 } });
    console.log(`Successfully updated ${result.modifiedCount} products with stock 1000`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateStock();
