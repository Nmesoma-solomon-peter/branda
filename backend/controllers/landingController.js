const Subscriber = require('../models/Subscriber');
const Visitor = require('../models/Visitor');

exports.trackVisitor = async (req, res) => {
  try {
    let visitor = await Visitor.findOne();
    if (!visitor) {
      visitor = await Visitor.create({ count: 1 });
    } else {
      visitor.count += 1;
      await visitor.save();
    }
    res.status(200).json({ success: true, count: visitor.count });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getVisitorCount = async (req, res) => {
  try {
    let visitor = await Visitor.findOne();
    res.status(200).json({ success: true, count: visitor ? visitor.count : 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email' });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }

    await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
