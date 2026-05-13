const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['Software', 'Controls', 'Electrical', 'Mechanical', 'Other'],
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  technicalFeasibility: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'In Progress', 'Implemented', 'Rejected'],
    default: 'Submitted'
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      date: { type: Date, default: Date.now },
      note: { type: String },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  impact: {
    timeSaved: { type: String },
    costSaved: { type: String },
    notes: { type: String }
  },
  images: [
    {
      type: String // file path in /uploads
    }
  ],
  submittedByEmail: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Idea', ideaSchema);
