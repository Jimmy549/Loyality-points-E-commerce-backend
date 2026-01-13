import { Schema } from 'mongoose';

export const PaymentsSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['stripe', 'points', 'hybrid'], required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'], default: 'pending' },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  refundId: { type: String },
  transactionId: { type: String },
  processedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });