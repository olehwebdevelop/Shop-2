import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  old_price: Number,
  discount_label: String,
  category: { type: String, required: true, default: 'other' },
  description: String,
  main_image: String,
  rating: { type: Number, default: 5.0 },
  reviews_count: { type: Number, default: 0 },
  stock_status: { type: String, default: 'In Stock' },
  specs: { type: Object, default: {} },
  reviews: { type: Array, default: [] },
  options: { type: Array, default: [] },
  addons: { type: Array, default: [] },
  features: { type: Array, default: [] }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);