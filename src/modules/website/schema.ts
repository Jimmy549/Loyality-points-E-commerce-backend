import { Schema } from 'mongoose';

export const WebsiteContentSchema = new Schema({
  section: { 
    type: String, 
    required: true,
    enum: ['hero', 'brands', 'new-arrivals', 'top-selling', 'dress-style', 'reviews', 'footer', 'about', 'contact']
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'list', 'object', 'array']
  },
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  metadata: {
    title: String,
    description: String,
    alt: String,
    link: String
  }
}, { timestamps: true });

WebsiteContentSchema.index({ section: 1, key: 1 }, { unique: true });