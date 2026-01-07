import { Document } from 'mongoose';

export interface Loyalty extends Document {
  pointsPerDollar: number;
  pointsToMoneyRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
