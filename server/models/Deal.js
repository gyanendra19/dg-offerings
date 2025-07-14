import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  coupon: {
    type: String,
    trim: true,
    default: ''
  },
  details: [{
    originalPrice: {
      type: Number,
      required: true
    },
    discountedPrice: {
      type: Number,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    numberOfPeopleRedeemed: {
      type: Number,
      default: 0
    }
  }],
  recent: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: true
  },
  detailedDescription: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  useCases: [{
    type: String,
    required: true
  }],
  keyBenefits: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  whatsIncluded: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  eligibilityCriteria: [{
    type: String,
    required: true
  }],
  faq: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }],
  reviews: [{
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Deal = mongoose.model('Deal', dealSchema);

export default Deal; 