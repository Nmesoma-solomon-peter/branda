const Settings = require('../models/Settings');

let cachedSettings = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000;

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const now = Date.now();
    if (!cachedSettings || now - lastFetch > CACHE_TTL) {
      cachedSettings = await Settings.findOne().select('maintenanceMode').lean();
      lastFetch = now;
    }

    if (!cachedSettings || !cachedSettings.maintenanceMode) {
      return next();
    }

    if (req.path === '/api/maintenance-status') {
      return next();
    }

    if (req.path.startsWith('/api/admin')) {
      return next();
    }

    if (req.path === '/api/health') {
      return next();
    }

    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
          return next();
        }
      } catch (err) {
        // invalid token, treat as non-admin
      }
    }

    return res.status(503).json({
      success: false,
      error: 'Platform is currently under maintenance. Please try again later.'
    });
  } catch (error) {
    next();
  }
};

module.exports = maintenanceMiddleware;
module.exports.clearCache = () => { cachedSettings = null; lastFetch = 0; };
