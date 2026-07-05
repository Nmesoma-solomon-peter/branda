const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/2fa/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('twoFactorEnabled');
    res.json({ success: true, enabled: user.twoFactorEnabled || false });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/2fa/enable', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA is already enabled' });
    }

    const secret = speakeasy.generateSecret({
      name: `Branda (${user.email})`,
      issuer: 'Branda'
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/2fa/verify', protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const user = await User.findById(req.user._id).select('twoFactorSecret twoFactorEnabled');

    if (!user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: '2FA not set up. Call /enable first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/2fa/disable', protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required to disable 2FA' });
    }

    const user = await User.findById(req.user._id).select('twoFactorSecret twoFactorEnabled');

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, error: '2FA is not enabled' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
