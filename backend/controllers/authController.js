const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, templates } = require('../services/email');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const userData = { name, email, password, role };
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) userData.referredBy = referrer._id;
    }

    const user = await User.create(userData);
    const token = user.generateAuthToken();

    const verificationToken = user.getVerificationToken();
    await user.save({ validateModifiedOnly: true });

    const verifyTmpl = templates.verifyEmail(name, verificationToken);
    sendEmail(email, verifyTmpl.subject, verifyTmpl.html).catch(err =>
      console.error(`[${new Date().toISOString()}] Verification email failed for ${email}:`, err.message)
    );

    const tmpl = role === 'specialist' ? templates.specialistWelcome(name) : templates.welcome(name);
    sendEmail(email, tmpl.subject, tmpl.html).catch(err =>
      console.error(`[${new Date().toISOString()}] Welcome email failed for ${email}:`, err.message)
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.login2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ success: false, error: 'userId and token are required' });
    }

    const user = await User.findById(userId).select('+twoFactorSecret +password');
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ success: false, error: 'Invalid 2FA token' });
    }

    const authToken = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, isVerified: req.user.isVerified }
  });
};

exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationExpire: { $gt: Date.now() }
    }).select('+verificationToken +verificationExpire');

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+verificationToken +verificationExpire');
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a verification email has been sent' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'Email is already verified' });
    }

    const token = user.getVerificationToken();
    await user.save({ validateModifiedOnly: true });

    const tmpl = templates.verifyEmail(user.name, token);
    sendEmail(user.email, tmpl.subject, tmpl.html).catch(err =>
      console.error(`[${new Date().toISOString()}] Resend verification email failed for ${user.email}:`, err.message)
    );

    res.status(200).json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+resetPasswordToken +resetPasswordExpire');
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a password reset email has been sent' });
    }

    const token = user.getResetPasswordToken();
    await user.save({ validateModifiedOnly: true });

    const tmpl = templates.passwordReset(user.name, token);
    sendEmail(user.email, tmpl.subject, tmpl.html).catch(err =>
      console.error(`[${new Date().toISOString()}] Password reset email failed for ${user.email}:`, err.message)
    );

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpire +password');

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.generateAuthToken();
    res.status(200).json({ success: true, token, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (req.body.password) {
      const isMatch = await user.matchPassword(req.body.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
      }
    }

    const Project = require('../models/Project');
    const Asset = require('../models/Asset');
    const Message = require('../models/Message');

    const projects = await Project.find({ owner: user._id });
    for (const project of projects) {
      const assets = await Asset.find({ project: project._id });
      const fs = require('fs');
      for (const asset of assets) {
        const filePath = require('path').join(__dirname, '..', asset.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await Asset.deleteMany({ project: project._id });
    }
    await Project.deleteMany({ owner: user._id });
    await Message.deleteMany({ $or: [{ from: user._id }, { to: user._id }] });

    await User.findByIdAndDelete(user._id);

    const tmpl = templates.accountDeleted(user.name);
    sendEmail(user.email, tmpl.subject, tmpl.html).catch(err =>
      console.error(`[${new Date().toISOString()}] Account deletion email failed for ${user.email}:`, err.message)
    );

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
