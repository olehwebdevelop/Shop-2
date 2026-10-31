import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query; 
    let filter = {};

    if (category) {
      const cat = category.toLowerCase();
      switch (cat) {
        case 'apple':
          filter = { category: 'apple' };
          break;
        case 'samsung':
          filter = { $or: [{ category: 'smartphones' }, { name: /samsung/i }] };
          break;
        case 'smartphones':
        case 'otherphone':
          filter = { category: 'smartphones' };
          break;
        case 'watchs':
        case 'watches':
          filter = { $or: [{ category: 'watchs' }, { name: /watch|fitbit/i }] };
          break;
        case 'console':
        case 'consoles':
        case 'gamezone':
          filter = { category: 'consoles' };
          break;
        case 'laptopsandpc':
        case 'laptops':
          filter = { category: 'laptops' };
          break;
        case 'tablets':
          filter = { category: 'tablets' };
          break;
        case 'televisions':
        case 'tv':
          filter = { category: 'televisions' };
          break;
        case 'kitchen-appliances':
          filter = { category: 'kitchen-appliances' };
          break;
        case 'home':
        case 'home-appliances':
          filter = { $or: [{ category: 'home-appliances' }, { category: 'home' }] };
          break;
        case 'photoandvideo':
          filter = { category: 'photoandvideo' };
          break;
        case 'audio':
          filter = { category: 'audio' };
          break;
        case 'health':
          filter = { category: 'health' };
          break;
        default:
          filter = { category: category };
          break;
      }
    }

    if (search) {
      const searchTerms = search.trim().split(/\s+/).filter(Boolean);
      const regexConditions = searchTerms.map(term => ({
        $or: [
          { name: new RegExp(term, 'i') },
          { category: new RegExp(term, 'i') },
          { description: new RegExp(term, 'i') }
        ]
      }));

      if (filter.$or || filter.category) {
        filter = { $and: [filter, ...regexConditions] };
      } else {
        filter.$and = regexConditions;
      }
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { slug } = req.params;
    const { rating, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const numRating = Math.min(5, Math.max(1, parseInt(rating) || 5));
    const author = req.user.nickname || req.user.email.split('@')[0];
    const date = new Date().toISOString().slice(0, 10);

    const newReview = {
      _id: new mongoose.Types.ObjectId(),
      userId: req.user._id.toString(),
      author,
      rating: numRating,
      text: text.trim(),
      date
    };

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    product.reviews.unshift(newReview);
    product.reviews_count = product.reviews.length;
    
    const sumRating = product.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    product.rating = Number((sumRating / product.reviews.length).toFixed(1));

    await product.save();

    res.status(201).json({
      message: 'Review added',
      review: newReview,
      reviews: product.reviews,
      rating: product.rating,
      reviews_count: product.reviews_count
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { slug, reviewId } = req.params;
    const product = await Product.findOne({ slug });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const reviewIndex = product.reviews.findIndex(r => String(r._id) === reviewId || String(r.id) === reviewId);
    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = product.reviews[reviewIndex];
    const currentUserId = req.user._id.toString();
    const currentAuthor = req.user.nickname || req.user.email.split('@')[0];

    const isOwner = (review.userId && review.userId === currentUserId) || (review.author === currentAuthor);
    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    product.reviews.splice(reviewIndex, 1);
    product.reviews_count = product.reviews.length;

    if (product.reviews.length > 0) {
      const sumRating = product.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      product.rating = Number((sumRating / product.reviews.length).toFixed(1));
    } else {
      product.rating = 5.0;
    }

    await product.save();

    res.json({
      message: 'Review deleted',
      reviews: product.reviews,
      rating: product.rating,
      reviews_count: product.reviews_count
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};