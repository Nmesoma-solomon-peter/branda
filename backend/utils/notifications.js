const Notification = require('../models/Notification');

const createNotification = async (userId, type, title, message, link = '') => {
  try {
    await Notification.create({ user: userId, type, title, message, link });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Notification creation failed:`, error.message);
  }
};

module.exports = { createNotification };
