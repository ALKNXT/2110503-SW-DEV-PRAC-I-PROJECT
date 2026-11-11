const Booking = require('../models/Booking');

const AVAILABLE_SLOTS = [1, 2, 3];

// Backfill slot values for bookings created before slot enforcement existed.
// The migration validates all affected users before writing any updates.
const migrateBookingSlots = async () => {
  const usersWithLegacyBookings = await Booking.distinct('user', {
    slot: null,
  });

  if (usersWithLegacyBookings.length === 0) return;

  const updates = [];

  for (const userId of usersWithLegacyBookings) {
    const bookings = await Booking.find({ user: userId })
      .select('_id +slot')
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    if (bookings.length > AVAILABLE_SLOTS.length) {
      throw new Error(
        `Cannot enforce the 3-booking limit: user ${userId} already has ${bookings.length} bookings. Resolve these records before startup.`,
      );
    }

    const usedSlots = new Set();

    for (const booking of bookings) {
      if (booking.slot == null) continue;

      if (
        !Number.isInteger(booking.slot) ||
        !AVAILABLE_SLOTS.includes(booking.slot) ||
        usedSlots.has(booking.slot)
      ) {
        throw new Error(
          `Cannot enforce booking slots: user ${userId} has an invalid or duplicate slot.`,
        );
      }

      usedSlots.add(booking.slot);
    }

    for (const booking of bookings) {
      if (booking.slot != null) continue;

      const freeSlot = AVAILABLE_SLOTS.find((slot) => !usedSlots.has(slot));

      if (freeSlot === undefined) {
        throw new Error(
          `Cannot assign a booking slot for user ${userId}. Resolve their bookings before startup.`,
        );
      }

      usedSlots.add(freeSlot);
      updates.push({
        updateOne: {
          filter: { _id: booking._id, slot: null },
          update: { $set: { slot: freeSlot } },
        },
      });
    }
  }

  if (updates.length > 0) {
    await Booking.bulkWrite(updates, { ordered: true });
  }
};

module.exports = migrateBookingSlots;
