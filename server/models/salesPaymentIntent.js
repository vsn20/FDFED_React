const mongoose = require('mongoose');

const SalesPaymentIntentSchema = new mongoose.Schema({
  payment_reference_id: {
    type: String,
    required: true,
    unique: true
  },
  salesman_id: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  manager_id: {
    type: String,
    default: null,
    ref: 'Employee'
  },
  branch_id: {
    type: String,
    required: true,
    ref: 'Branch'
  },
  status: {
    type: String,
    enum: ['initiated', 'pending', 'paid', 'failed', 'expired'],
    default: 'initiated'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpay_link_id: {
    type: String,
    default: null
  },
  razorpay_order_id: {
    type: String,
    default: null
  },
  razorpay_payment_id: {
    type: String,
    default: null
  },
  short_url: {
    type: String,
    default: null
  },
  expires_at: {
    type: Date,
    default: null
  },
  sale_created: {
    type: Boolean,
    default: false
  },
  sale_id: {
    type: String,
    default: null
  },
  sale_payload: {
    type: Object,
    required: true
  },
  last_status_payload: {
    type: Object,
    default: null
  }
}, { timestamps: true });

SalesPaymentIntentSchema.index({ salesman_id: 1, createdAt: -1 });
SalesPaymentIntentSchema.index({ manager_id: 1, createdAt: -1 });
SalesPaymentIntentSchema.index({ status: 1 });

module.exports = mongoose.models.SalesPaymentIntent || mongoose.model('SalesPaymentIntent', SalesPaymentIntentSchema);
