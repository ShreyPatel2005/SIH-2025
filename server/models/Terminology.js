import mongoose from 'mongoose';

const terminologySchema = new mongoose.Schema({
  // Basic term information
  term: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  system: {
    type: String,
    required: true,
    enum: ['NAMASTE', 'ICD-11 TM2', 'ICD-11 Biomedicine', 'WHO Ayurveda', 'ICD-11 BIOMEDICINE', 'WHO AYURVEDA'],
    index: true
  },
  
  // Additional metadata
  description: {
    type: String,
    default: ''
  },
  
  category: {
    type: String,
    default: ''
  },
  
  // Versioning and timestamps
  version: {
    type: String,
    default: '1.0'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdBy: {
    type: String,
    default: 'system'
  },
  
  updatedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Text index for search functionality
terminologySchema.index({ 
  term: 'text', 
  description: 'text', 
  category: 'text' 
});

// Compound indexes for efficient queries
terminologySchema.index({ system: 1, isActive: 1 });
terminologySchema.index({ code: 1, system: 1 });

export default mongoose.model('Terminology', terminologySchema);
