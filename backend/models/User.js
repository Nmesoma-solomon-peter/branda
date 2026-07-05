const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    required: [true, 'Please select a role'],
    enum: ['sme', 'specialist', 'admin']
  },
  profileImage: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  location: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: [500, 'Bio cannot exceed 500 characters'] },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  verificationExpire: { type: Date, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },
  twoFactorSecret: { type: String, select: false },
  twoFactorEnabled: { type: Boolean, default: false },
  acceptedTerms: { type: Boolean, default: false },
  acceptedTermsAt: { type: Date },
  onboardingCompleted: { type: Boolean, default: false },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  hourlyRate: { type: Number, default: 0 },
  yearsExperience: { type: Number, default: 0 },
  skills: [{ type: String }],
  industries: [{ type: String }],
  portfolioApproved: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  suspendedReason: { type: String, default: '' },
  kyc: {
    status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    fullName: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    idType: { type: String, enum: ['nin', 'passport', 'drivers_license', ''], default: '' },
    idNumber: { type: String, default: '' },
    idImageFront: { type: String, default: '' },
    idImageBack: { type: String, default: '' },
    selfieWithId: { type: String, default: '' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

UserSchema.methods.getVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

UserSchema.methods.getResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return token;
};

UserSchema.methods.getReferralCode = function () {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  return this.referralCode;
};

module.exports = mongoose.model('User', UserSchema);
