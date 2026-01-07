import { Document } from 'mongoose';

export interface Payment extends Document {
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  cardDetails: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
  };
  transactionId?: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}