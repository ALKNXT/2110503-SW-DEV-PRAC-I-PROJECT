const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingDate: {
      type: Date,
      required: [true, 'Please provide a booking date'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'Please select a rental car provider'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ user: 1, bookingDate: 1 });

module.exports =
  mongoose.models.Booking ||
  mongoose.model('Booking', bookingSchema, 'bookings');
