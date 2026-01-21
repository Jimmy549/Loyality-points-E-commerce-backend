import { Schema } from 'mongoose';

export const NotificationsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['ORDER', 'LOYALTY', 'GENERAL', 'SALE'], required: true },
  isRead: { type: Boolean, default: false },
  data: { type: Schema.Types.Mixed }
}, { timestamps: true });