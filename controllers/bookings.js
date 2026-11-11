const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

const parseObjectId = (value) => {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    return null;
  }

  return new mongoose.Types.ObjectId(value);
};

const handleBookingError = (res, error, action) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(`${action} booking failed:`, error.message);

  return res.status(500).json({
    success: false,
    message: `Unable to ${action.toLowerCase()} booking`,
  });
};

const parseBookingDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
};

const canManageBooking = (booking, user) => {
  return (
    user.role === 'admin' ||
    booking.user.toString() === user.id
  );
};

// GET /api/v1/bookings
exports.getBookings = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? {} : { user: req.user.id };

    let query = Booking.find(filter)
      .sort({ bookingDate: 1 })
      .populate('provider', 'name address telephone');

    if (isAdmin) {
      query = query.populate('user', 'name email telephone');
    }

    const bookings = await query;

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return handleBookingError(res, error, 'Get');
  }
};

// GET /api/v1/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this booking',
      });
    }

    await booking.populate('provider', 'name address telephone');

    if (req.user.role === 'admin') {
      await booking.populate('user', 'name email telephone');
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleBookingError(res, error, 'Get');
  }
};

// POST /api/v1/bookings
exports.createBooking = async (req, res) => {
  try {
    const { bookingDate: dateInput, providerId } = req.body || {};
    const bookingDate = parseBookingDate(dateInput);

    if (!bookingDate) {
      return res.status(400).json({
        success: false,
        message: 'bookingDate must use YYYY-MM-DD format',
      });
    }

    const providerObjectId = parseObjectId(providerId);

    if (!providerObjectId) {
      return res.status(400).json({
        success: false,
        message: 'providerId must be a valid provider id',
      });
    }

    const provider = await Provider.findOne({
      _id: providerObjectId,
      isActive: true,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Active provider not found',
      });
    }

    const bookingCount = await Booking.countDocuments({
      user: req.user.id,
    });

    if (bookingCount >= 3) {
      return res.status(409).json({
        success: false,
        message: 'A user can have no more than 3 bookings',
      });
    }

    const booking = await Booking.create({
      bookingDate,
      user: req.user.id,
      provider: provider._id,
    });

    await booking.populate('provider', 'name address telephone');

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleBookingError(res, error, 'Create');
  }
};

// PUT /api/v1/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this booking',
      });
    }

    const body = req.body || {};
    let hasUpdate = false;

    if (body.bookingDate !== undefined) {
      const bookingDate = parseBookingDate(body.bookingDate);

      if (!bookingDate) {
        return res.status(400).json({
          success: false,
          message: 'bookingDate must use YYYY-MM-DD format',
        });
      }

      booking.bookingDate = bookingDate;
      hasUpdate = true;
    }

    if (body.providerId !== undefined) {
      const providerObjectId = parseObjectId(body.providerId);

      if (!providerObjectId) {
        return res.status(400).json({
          success: false,
          message: 'providerId must be a valid provider id',
        });
      }

      const provider = await Provider.findOne({
        _id: providerObjectId,
        isActive: true,
      });

      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Active provider not found',
        });
      }

      booking.provider = provider._id;
      hasUpdate = true;
    }

    if (!hasUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Provide bookingDate or providerId to update',
      });
    }

    // save() runs the Booking schema validation before writing.
    await booking.save();
    await booking.populate('provider', 'name address telephone');

    if (req.user.role === 'admin') {
      await booking.populate('user', 'name email telephone');
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return handleBookingError(res, error, 'Update');
  }
};

// DELETE /api/v1/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this booking',
      });
    }

    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Booking deleted',
      data: { id: booking._id },
    });
  } catch (error) {
    return handleBookingError(res, error, 'Delete');
  }
};
