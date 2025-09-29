import mongoose from 'mongoose';

const emrDataSchema = new mongoose.Schema({
  // Patient information
  patientId: {
    type: String,
    required: true,
    index: true
  },
  
  // Clinician information
  clinicianId: {
    type: String,
    required: true
  },
  
  // Encounter details
  encounterNotes: {
    type: String,
    required: true
  },
  
  // FHIR Bundle data
  fhirBundle: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Processing results
  processedTerms: [{
    originalTerm: String,
    originalSystem: String,
    mappedCodes: [{
      code: String,
      system: String,
      term: String
    }],
    fhirResource: mongoose.Schema.Types.Mixed
  }],
  
  // Error handling
  errorMessage: {
    type: String
  },
  
  // Timestamps
  processedAt: {
    type: Date
  },
  
  // Metadata
  submittedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
emrDataSchema.index({ patientId: 1, createdAt: -1 });
emrDataSchema.index({ status: 1 });
emrDataSchema.index({ createdAt: -1 });

export default mongoose.model('EMRData', emrDataSchema);
