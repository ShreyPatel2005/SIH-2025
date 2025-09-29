import mongoose from 'mongoose';

const mappingSchema = new mongoose.Schema({
  // Source term (usually NAMASTE)
  sourceTerm: {
    term: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    system: {
      type: String,
      required: true,
      default: 'NAMASTE'
    }
  },
  
  // Mapped terms (ICD-11, WHO Ayurveda, etc.)
  mappedTerms: [{
    term: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    system: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1.0
    },
    mappingType: {
      type: String,
      enum: ['exact', 'broad', 'narrow', 'related'],
      default: 'exact'
    }
  }],
  
  // Mapping metadata
  mappingStatus: {
    type: String,
    enum: ['draft', 'reviewed', 'approved', 'deprecated'],
    default: 'draft'
  },
  
  reviewedBy: {
    type: String,
    default: ''
  },
  
  reviewedAt: {
    type: Date
  },
  
  // Versioning
  version: {
    type: String,
    default: '1.0'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Additional notes
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
mappingSchema.index({ 'sourceTerm.code': 1 });
mappingSchema.index({ 'sourceTerm.system': 1 });
mappingSchema.index({ mappingStatus: 1, isActive: 1 });

export default mongoose.model('Mapping', mappingSchema);
