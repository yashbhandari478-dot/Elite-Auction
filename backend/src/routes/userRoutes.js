const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAllUsers,
  getSuppliers,
  getCustomers,
  getProfile,
  updateProfile,
  approveUser,
  blockUser,
  unblockUser,
  deleteUser
} = require('../controllers/userController');
const { authorize } = require('../middleware/auth');

// Profile routes — available to ANY logged-in user
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin-only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/suppliers', protect, authorize('admin'), getSuppliers);
router.get('/customers', protect, authorize('admin'), getCustomers);
router.put('/:id/approve', protect, authorize('admin'), approveUser);
router.put('/:id/block', protect, authorize('admin'), blockUser);
router.put('/:id/unblock', protect, authorize('admin'), unblockUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
