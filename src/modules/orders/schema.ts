import { Schema } from 'mongoose';

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  title: { type: String, required: true }
}, { _id: false });

export const OrdersSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderNumber: { 
    type: String, 
    unique: true,
    default: function() {
      return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  pointsUsed: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], 
    default: 'PENDING',
    index: true 
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal'],
    default: 'credit_card'
  },
  paymentDetails: {
    cardNumber: String,
    cardholderName: String,
    expiryDate: String,
    cvv: String
  },
  trackingNumber: { type: String },
  notes: { type: String }
}, { timestamps: true });