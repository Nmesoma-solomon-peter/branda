const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const { protect } = require('../middleware/auth');

router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const contract = await Contract.findOne({ project: req.params.projectId })
      .populate('client', 'name email')
      .populate('specialist', 'name email');
    res.status(200).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { projectId, specialistId, title, scope, amount, currency, endDate, terms } = req.body;
    if (!projectId || !specialistId || !title || !scope || !amount) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }
    const contract = await Contract.create({
      project: projectId, client: req.user._id, specialist: specialistId,
      title, scope, amount, currency, endDate, terms, status: 'pending'
    });
    res.status(201).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id/sign', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });
    const isClient = contract.client.toString() === req.user._id.toString();
    const isSpecialist = contract.specialist.toString() === req.user._id.toString();
    if (!isClient && !isSpecialist) return res.status(403).json({ success: false, error: 'Not authorized' });
    if (isClient) { contract.clientSigned = true; contract.clientSignedAt = new Date(); }
    if (isSpecialist) { contract.specialistSigned = true; contract.specialistSignedAt = new Date(); }
    if (contract.clientSigned && contract.specialistSigned) contract.status = 'active';
    await contract.save();
    res.status(200).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contract) return res.status(404).json({ success: false, error: 'Contract not found' });
    res.status(200).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
