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
    slot: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
      select: false,
    },
  },
  {
    timestamps: true,
    // Index creation is explicitly awaited after legacy data is migrated.
    autoIndex: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        delete returnedObject.slot;
        delete returnedObject.__v;
        return returnedObject;
      },
    },
  },
);

bookingSchema.index(
  { user: 1, slot: 1 },
  { unique: true, name: 'unique_booking_slot_per_user' },
);

module.exports =
  mongoose.models.Booking ||
  mongoose.model('Booking', bookingSchema, 'bookings');
