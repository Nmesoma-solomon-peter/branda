const express = require('express');
const router = express.Router();
const { register, login, login2FA, getMe, verifyEmail, resendVerification, forgotPassword, resetPassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.post('/login/2fa', login2FA);
router.get('/me', protect, getMe);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.delete('/account', protect, deleteAccount);

router.get('/referral/:code', async (req, res) => {
  try {
    const user = await User.findOne({ referralCode: req.params.code }).select('name');
    if (!user) return res.status(404).json({ success: false, error: 'Invalid referral code' });
    res.status(200).json({ success: true, referrer: user.name });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
