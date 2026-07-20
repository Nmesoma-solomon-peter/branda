const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, async (req, res) => {
  try {
    let chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name email role profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    if (chats.length === 0) {
      const supportUser = await User.findOne({ role: 'admin', email: 'support@branda.com' });
      if (supportUser) {
        const newChat = await Chat.create({
          participants: [req.user._id, supportUser._id]
        });
        await ChatMessage.create({
          chat: newChat._id,
          sender: supportUser._id,
          text: 'Welcome to Branda! How can we help you today? You can ask about your projects, report an issue, or get help with anything on the platform.',
          read: false
        });
        chats = await Chat.find({ participants: req.user._id })
          .populate('participants', 'name email role profileImage')
          .populate('lastMessage')
          .sort({ updatedAt: -1 });
      }
    }

    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
      const unread = await ChatMessage.countDocuments({
        chat: chat._id,
        sender: { $ne: req.user._id },
        read: false
      });
      return { ...chat.toObject(), unreadCount: unread };
    }));

    res.status(200).json({ success: true, chats: chatsWithUnread });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ success: false, error: 'participantId is required' });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 }
    }).populate('participants', 'name email role profileImage');

    if (!chat) {
      chat = await Chat.create({ participants: [req.user._id, participantId] });
      chat = await Chat.findById(chat._id).populate('participants', 'name email role profileImage');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id/messages', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ chat: req.params.id })
      .populate('sender', 'name role profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await ChatMessage.updateMany(
      { chat: req.params.id, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/:id/messages', protect, upload.single('file'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { text } = req.body;
    const file = req.file ? `/uploads/${req.file.filename}` : '';
    const fileName = req.file ? req.file.originalname : '';

    if (!text && !file) {
      return res.status(400).json({ success: false, error: 'Message text or file is required' });
    }

    const message = await ChatMessage.create({
      chat: req.params.id,
      sender: req.user._id,
      text: text || '',
      file,
      fileName
    });

    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    const populated = await ChatMessage.findById(message._id).populate('sender', 'name role profileImage');

    const io = req.app.get('io');
    if (io) {
      chat.participants.forEach(pid => {
        if (pid.toString() !== req.user._id.toString()) {
          io.to(pid.toString()).emit('receive_message', { chatId: chat._id, message: populated });
        }
      });
    }

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/unread/count', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id });
    const chatIds = chats.map(c => c._id);
    const count = await ChatMessage.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: req.user._id },
      read: false
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/unread/total', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id });
    const chatIds = chats.map(c => c._id);
    const count = await ChatMessage.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: req.user._id },
      read: false
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
