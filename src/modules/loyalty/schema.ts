import { Schema } from 'mongoose';

export const LoyaltySchema = new Schema({
  pointsPerDollar: { type: Number, default: 10 }, // $1 = 10 points
  pointsToMoneyRate: { type: Number, default: 0.1 }, // 10 points = $1
  isActive: { type: Boolean, default: true }
}, { timestamps: true });