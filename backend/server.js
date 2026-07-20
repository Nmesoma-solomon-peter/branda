const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const http = require('http');
require('dotenv').config();

const uploadsDir = path.join(__dirname, 'uploads');
['business', 'specialist', 'admin', 'other'].forEach(sub => {
  const dir = path.join(uploadsDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const maintenanceMiddleware = require('./middleware/maintenance');
const Settings = require('./models/Settings');
const User = require('./models/User');

connectDB().then(async () => {
  try {
    const existing = await User.findOne({ email: 'support@branda.com' });
    if (!existing) {
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash('support123', 10);
      await User.create({
        name: 'Branda Support',
        email: 'support@branda.com',
        password: hashed,
        role: 'admin',
        isVerified: true
      });
      console.log('Support user created');
    }
  } catch (e) {
    console.error('Failed to create support user:', e.message);
  }
});

const app = express();
const server = http.createServer(app);

try {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'https://branda-five.vercel.app',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('typing', ({ chatId, userId }) => {
      socket.to(chatId).emit('user_typing', { chatId, userId });
    });

    socket.on('disconnect', () => {});
  });

  app.set('io', io);
} catch (e) {
  console.error('Socket.io not available:', e.message);
}

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://branda-five.vercel.app',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.set('trust proxy', 1);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const exempt = ['/maintenance-status', '/visitors', '/testimonials', '/health'];
    return exempt.some(p => req.path === p);
  }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many uploads, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', generalLimiter);
app.use('/api/assets/upload', uploadLimiter);

app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const landingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const subscribeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/visitors', landingLimiter);
app.use('/api/testimonials', landingLimiter);
app.post('/api/subscribe', subscribeLimiter);

app.get('/api/maintenance-status', async (req, res) => {
  try {
    const settings = await Settings.findOne().select('maintenanceMode').lean();
    res.json({ maintenance: settings?.maintenanceMode || false });
  } catch {
    res.json({ maintenance: false });
  }
});

app.use(maintenanceMiddleware);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/landing'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/search', require('./routes/search'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/chats', require('./routes/chat'));
app.use('/api/auth', require('./routes/twoFactor'));
app.use('/api/annotations', require('./routes/annotations'));
app.use('/api/versions', require('./routes/versions'));
app.use('/', require('./routes/sitemap'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/promo-codes', require('./routes/promoCodes'));
app.use('/api/case-studies', require('./routes/caseStudies'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/review-reports', require('./routes/reviewReports'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
