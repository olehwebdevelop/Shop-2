import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  nickname: { 
    type: String, 
    default: function() {
      return this.email.split('@')[0];
    }
  },
  phone: { 
    type: String, 
    default: ''
  },
  bonuses: { 
    type: Number, 
    default: 250 
  },
  ordersCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);