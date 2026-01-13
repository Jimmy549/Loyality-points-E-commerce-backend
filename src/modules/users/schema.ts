import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UsersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], default: 'USER' },
  loyaltyPoints: { type: Number, default: 0 },
  provider: { type: String, enum: ['local', 'google', 'github', 'discord'], default: 'local' },
  providerId: { type: String },
  avatar: { type: String },
  providers: [{
    name: { type: String, enum: ['local', 'google', 'github', 'discord'] },
    providerId: { type: String },
    linkedAt: { type: Date, default: Date.now }
  }],
  loginHistory: [{
    method: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }
  }],
  lastLogin: { type: Date },
  lastLoginMethod: { type: String }
}, { timestamps: true });

UsersSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});