const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, telephone, email, password } = req.body || {};

    const user = await User.create({
      name,
      telephone,
      email,
      password,
    });
    return sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'Email is already registered' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error('Registration failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Unable to register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Unable to log in' });
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  return res.status(statusCode).json({ success: true, token });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    'name telephone email role createdAt',
  );

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: 'User no longer exists' });
  }

  return res.status(200).json({ success: true, data: user });
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { tokenVersion: 1 } },
      { new: true },
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User no longer exists' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout failed:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Unable to log out' });
  }
};
