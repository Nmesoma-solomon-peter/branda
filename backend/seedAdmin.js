require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const email = process.env.ADMIN_EMAIL || 'admin@branda.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated ${email} to admin role`);
    } else {
      console.log(`Admin user ${email} already exists`);
    }
  } else {
    await User.create({ name: 'Admin', email, password, role: 'admin' });
    console.log(`Admin user created: ${email}`);
  }

  await mongoose.disconnect();
};

seedAdmin().catch(e => { console.error(e); process.exit(1); });
