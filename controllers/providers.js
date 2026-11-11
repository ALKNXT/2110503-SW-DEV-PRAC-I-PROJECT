const Provider = require('../models/Provider');

const handleProviderError = (res, error, action) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(`${action} failed:`, error.message);

  return res.status(500).json({
    success: false,
    message: `Unable to ${action.toLowerCase()} provider`,
  });
};

// GET /api/v1/providers
exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    return handleProviderError(res, error, 'Get');
  }
};

// GET /api/v1/providers/:id
exports.getProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    return handleProviderError(res, error, 'Get');
  }
};

// POST /api/v1/providers
exports.createProvider = async (req, res) => {
  try {
    const { name, address, telephone } = req.body || {};

    const provider = await Provider.create({
      name,
      address,
      telephone,
    });

    return res.status(201).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    return handleProviderError(res, error, 'Create');
  }
};

// PUT /api/v1/providers/:id
exports.updateProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    const allowedFields = ['name', 'address', 'telephone'];
    let hasUpdate = false;

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        provider[field] = req.body[field];
        hasUpdate = true;
      }
    }

    if (!hasUpdate) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field: name, address, telephone',
      });
    }
    await provider.save();

    return res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    return handleProviderError(res, error, 'Update');
  }
};

// PATCH /api/v1/providers/:id/status
// Activate a previously deactivated provider.
exports.updateProviderStatus = async (req, res) => {
  if (req.body?.isActive !== true) {
    return res.status(400).json({
      success: false,
      message: 'isActive must be true to activate a provider',
    });
  }

  try {
    // Find by id without filtering isActive so inactive providers can be restored.
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    provider.isActive = true;
    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Provider activated',
      data: provider,
    });
  } catch (error) {
    return handleProviderError(res, error, 'Update status for');
  }
};

// DELETE /api/v1/providers/:id
// Soft delete: hides the provider instead of removing its document.
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    provider.isActive = false;
    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Provider deactivated',
      data: { id: provider._id },
    });
  } catch (error) {
    return handleProviderError(res, error, 'Delete');
  }
};
