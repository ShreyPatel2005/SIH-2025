import mongoose from 'mongoose';

const MappingSchema = new mongoose.Schema({
  sourceCode: {
    type: String,
    required: true,
    index: true
  },
  sourceTerm: {
    type: String,
    required: true
  },
  sourceSystem: {
    type: String,
    required: true
  },
  targetCode: {
    type: String,
    required: true
  },
  targetTerm: {
    type: String,
    required: true
  },
  targetSystem: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: 1.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for faster lookups
MappingSchema.index({ sourceCode: 1, sourceSystem: 1, targetSystem: 1 });

const Mapping = mongoose.model('Mapping', MappingSchema);

export default Mapping;