const mongoose = require('mongoose');

const crimeStatsSchema = new mongoose.Schema(
  {
    theft: {
      type: Number,
      required: [true, 'Theft count is required'],
      min: [0, 'Value cannot be negative'],
    },
    assault: {
      type: Number,
      required: [true, 'Assault count is required'],
      min: [0, 'Value cannot be negative'],
    },
    fraud: {
      type: Number,
      required: [true, 'Fraud count is required'],
      min: [0, 'Value cannot be negative'],
    },
    cybercrime: {
      type: Number,
      required: [true, 'Cybercrime count is required'],
      min: [0, 'Value cannot be negative'],
    },
    crimeIndex: {
      type: Number,
      required: [true, 'Crime Index is required'],
      min: [0, 'Value cannot be negative'],
      max: [100, 'Crime Index cannot exceed 100'],
    },
    region: {
      type: String,
      default: 'National',
      trim: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Virtual for total crimes
crimeStatsSchema.virtual('totalCrimes').get(function () {
  return this.theft + this.assault + this.fraud + this.cybercrime;
});

crimeStatsSchema.set('toJSON', { virtuals: true });
crimeStatsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CrimeStats', crimeStatsSchema);
