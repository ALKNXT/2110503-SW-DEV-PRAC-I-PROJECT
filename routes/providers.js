const express = require('express');
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  updateProviderStatus,
  deleteProvider,
} = require('../controllers/providers');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getProviders)
  .post(protect, authorize('admin'), createProvider);

router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  updateProviderStatus,
);

router
  .route('/:id')
  .get(protect, getProvider)
  .put(protect, authorize('admin'), updateProvider)
  .delete(protect, authorize('admin'), deleteProvider);

module.exports = router;
