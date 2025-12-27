import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    month: {
      type: Number, // 1-12 for easy querying by month
      required: true,
      index: true
    },
    year: {
      type: Number,
      required: true,
      index: true
    },
    categories: {
      type: [String], // e.g., ['volunteer', 'ethics', 'physical']
      default: []
    },
    location: {
      type: String,
      default: ''
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    capacity: {
      type: Number,
      default: null
    },
    link: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for efficient querying
eventSchema.index({ month: 1, year: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

export default mongoose.model('Event', eventSchema);
