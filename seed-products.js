const mongoose = require('mongoose');
require('dotenv').config();

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  isOnSale: { type: Boolean, default: false },
  salePrice: { type: Number },
  loyaltyType: { type: String, enum: ['MONEY', 'POINTS', 'HYBRID'], required: true },
  loyaltyPointsCost: { type: Number },
  category: { type: String },
  tags: [{ type: String }],
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

const products = [
  {
    title: "T-shirt with Tape Details",
    description: "This t-shirt is perfect for any occasion",
    price: 120,
    stock: 25,
    images: ["/images/pic1.png", "/images/pic10.png", "/images/pic11.png"],
    isOnSale: false,
    loyaltyType: 'MONEY',
    category: 'clothing',
    tags: ['t-shirt', 'casual', 'new-arrival'],
  },
  {
    title: "Skinny Fit Jeans",
    description: "Comfortable skinny fit jeans for everyday wear",
    price: 260,
    salePrice: 208,
    stock: 15,
    images: ["/images/pic2.png"],
    isOnSale: true,
    loyaltyType: 'HYBRID',
    loyaltyPointsCost: 200,
    category: 'clothing',
    tags: ['jeans', 'casual', 'new-arrival'],
  },
  {
    title: "Checked Shirt",
    description: "Classic checked shirt for a smart casual look",
    price: 180,
    stock: 30,
    images: ["/images/pic3.png"],
    isOnSale: false,
    loyaltyType: 'MONEY',
    category: 'clothing',
    tags: ['shirt', 'casual', 'new-arrival'],
  },
  {
    title: "Sleeve Striped T-shirt",
    description: "Stylish striped t-shirt with sleeve details",
    price: 160,
    salePrice: 112,
    stock: 20,
    images: ["/images/pic4.png", "/images/pic10.png", "/images/pic11.png"],
    isOnSale: true,
    loyaltyType: 'POINTS',
    loyaltyPointsCost: 120,
    category: 'clothing',
    tags: ['t-shirt', 'casual', 'new-arrival'],
  },
  {
    title: "Vertical Striped Shirt",
    description: "Elegant vertical striped shirt",
    price: 232,
    salePrice: 185.6,
    stock: 12,
    images: ["/images/pic5.png", "/images/pic10.png", "/images/pic11.png"],
    isOnSale: true,
    loyaltyType: 'HYBRID',
    loyaltyPointsCost: 180,
    category: 'clothing',
    tags: ['shirt', 'formal', 'top-selling'],
  },
  {
    title: "Courage Graphic T-shirt",
    description: "Bold graphic t-shirt with courage print",
    price: 145,
    stock: 35,
    images: ["/images/pic6.png", "/images/pic10.png", "/images/pic11.png"],
    isOnSale: false,
    loyaltyType: 'MONEY',
    category: 'clothing',
    tags: ['t-shirt', 'graphic', 'top-selling'],
  },
  {
    title: "Loose Fit Bermuda Shorts",
    description: "Comfortable loose fit bermuda shorts",
    price: 80,
    stock: 40,
    images: ["/images/pic7.png"],
    isOnSale: false,
    loyaltyType: 'POINTS',
    loyaltyPointsCost: 60,
    category: 'clothing',
    tags: ['shorts', 'casual', 'top-selling'],
  },
  {
    title: "Faded Skinny Jeans",
    description: "Trendy faded skinny jeans",
    price: 210,
    stock: 18,
    images: ["/images/pic8.png"],
    isOnSale: false,
    loyaltyType: 'HYBRID',
    loyaltyPointsCost: 160,
    category: 'clothing',
    tags: ['jeans', 'casual', 'top-selling'],
  },
  {
    title: "Polo with Contrast Trims",
    description: "Classic polo with contrast trim details",
    price: 242,
    salePrice: 193.6,
    stock: 22,
    images: ["/images/pic12.png", "/images/pic10.png", "/images/pic11.png"],
    isOnSale: true,
    loyaltyType: 'MONEY',
    category: 'clothing',
    tags: ['polo', 'casual', 'related'],
  },
  {
    title: "Gradient Graphic T-shirt",
    description: "Modern gradient graphic t-shirt",
    price: 145,
    stock: 28,
    images: ["/images/pic13.png", "/images/pic10.png", "/images/pic11.png"],
    isOnSale: false,
    loyaltyType: 'POINTS',
    loyaltyPointsCost: 110,
    category: 'clothing',
    tags: ['t-shirt', 'graphic', 'related'],
  },
  {
    title: "Polo with Tipping Details",
    description: "Stylish polo with tipping details",
    price: 180,
    stock: 33,
    images: ["/images/pic14.png"],
    isOnSale: false,
    loyaltyType: 'HYBRID',
    loyaltyPointsCost: 140,
    category: 'clothing',
    tags: ['polo', 'casual', 'related'],
  },
  {
    title: "Black Striped T-shirt",
    description: "Classic black striped t-shirt",
    price: 150,
    salePrice: 105,
    stock: 45,
    images: ["/images/pic15.png"],
    isOnSale: true,
    loyaltyType: 'MONEY',
    category: 'clothing',
    tags: ['t-shirt', 'casual', 'related'],
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);
    
    console.log('\nProduct IDs mapping:');
    createdProducts.forEach((product, index) => {
      console.log(`Frontend ID ${index + 1} -> Backend ID: ${product._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
