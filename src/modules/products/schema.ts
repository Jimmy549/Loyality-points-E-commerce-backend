import { Schema } from 'mongoose';

export const ProductsSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, index: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  isOnSale: { type: Boolean, default: false, index: true },
  salePrice: { type: Number },
  loyaltyType: { type: String, enum: ['MONEY', 'POINTS', 'HYBRID'], required: true, index: true },
  loyaltyPointsCost: { type: Number },
  category: { type: String, index: true },
  tags: [{ type: String }],
}, { timestamps: true });

// Create text index for search
ProductsSchema.index({ title: 'text', description: 'text' });