const mongoose = require('mongoose');

const ContentStrategySchema = new mongoose.Schema({
  targetAudience: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  goals: {
    type: String,
    required: true,
  },
  // --- NEW: Add fields to store the plan's date range ---
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  generatedPlan: {
    blogTitle: String,
    suggestedFormats: [String],
    postFrequency: String,
    calendar: [{
      day: Number,
      title: String,
      format: String,
      platform: String,
      postTime: String,
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ContentStrategy', ContentStrategySchema);