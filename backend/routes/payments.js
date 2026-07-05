const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');

const getPaystackSecret = async () => {
  const settings = await Settings.findOne().select('paystackSecretKey paystackEnabled');
  return settings?.paystackEnabled ? settings.paystackSecretKey : process.env.PAYSTACK_SECRET_KEY;
};

router.post('/initiate', protect, authorize('sme'), async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    if (!projectId || !amount) {
      return res.status(400).json({ success: false, error: 'projectId and amount are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const reference = `BRNDA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const payment = await Payment.create({
      project: projectId,
      payer: req.user._id,
      amount,
      reference,
      status: 'pending'
    });

    const PAYSTACK_SECRET = await getPaystackSecret();
    if (PAYSTACK_SECRET) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: req.user.email,
            amount: amount * 100,
            reference,
            metadata: { projectId, paymentId: payment._id }
          })
        });
        const data = await response.json();
        if (data.status) {
          payment.paystackRef = data.data?.reference || '';
          await payment.save();
          return res.status(200).json({ success: true, payment, authorizationUrl: data.data?.authorization_url });
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Paystack init error:`, err.message);
      }
    }

    res.status(200).json({ success: true, payment, message: 'Payment reference created. Complete payment manually if Paystack is not configured.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/verify/:reference', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ reference: req.params.reference });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    const PAYSTACK_SECRET = await getPaystackSecret();
    if (PAYSTACK_SECRET && payment.status === 'pending') {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
        });
        const data = await response.json();
        if (data.status && data.data?.status === 'success') {
          payment.status = 'success';
          await payment.save();
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Paystack verify error:`, err.message);
      }
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ project: req.params.projectId })
      .populate('payer', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ payer: req.user._id })
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const settings = await Settings.findOne().select('paystackSecretKey paystackEnabled');
    const PAYSTACK_SECRET = settings?.paystackEnabled ? settings.paystackSecretKey : process.env.PAYSTACK_SECRET_KEY;
    
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { event, data } = req.body;
    if (event === 'charge.success') {
      const payment = await Payment.findOne({ reference: data.reference });
      if (payment) {
        payment.status = 'success';
        payment.metadata = data;
        await payment.save();
      }
    }

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(200);
  }
});

module.exports = router;
