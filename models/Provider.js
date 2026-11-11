const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the provider name'],
      trim: true,
      maxlength: [150, 'Provider name cannot exceed 150 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please provide the provider address'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    telephone: {
      type: String,
      required: [true, 'Please provide a telephone number'],
      trim: true,
      maxlength: [25, 'Telephone number cannot exceed 25 characters'],
      match: [
        /^[+]?[\d\s().-]{7,25}$/,
        'Please provide a valid telephone number',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

providerSchema.index({ name: 1 });

module.exports =
  mongoose.models.Provider ||
  mongoose.model('Provider', providerSchema, 'providers');
