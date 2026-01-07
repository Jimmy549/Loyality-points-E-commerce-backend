import { Schema } from 'mongoose';

export const PaymentsSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'paypal'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  cardDetails: {
    cardNumber: { type: String, required: true },
    cardholderName: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true }
  },
  transactionId: { type: String },
  processedAt: { type: Date }
}, { timestamps: true });