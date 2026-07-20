const Review = require('../models/Review');
const Project = require('../models/Project');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { specialist, project, rating, comment } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ success: false, error: 'Project not found' });
    if (projectDoc.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: 'Only the project owner can review' });
    if (projectDoc.status !== 'completed')
      return res.status(400).json({ success: false, error: 'Can only review completed projects' });

    const existing = await Review.findOne({ project });
    if (existing) return res.status(400).json({ success: false, error: 'Already reviewed this project' });

    const review = await Review.create({
      reviewer: req.user._id,
      specialist,
      project,
      rating,
      comment
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getSpecialistReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ specialist: id })
        .populate('reviewer', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ specialist: id })
    ]);

    const ratingStats = await Review.aggregate([
      { $match: { specialist: require('mongoose').Types.ObjectId.createFromHexString(id) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      reviews,
      total,
      averageRating: ratingStats[0]?.averageRating
        ? Math.round(ratingStats[0].averageRating * 10) / 10
        : 0,
      reviewCount: ratingStats[0]?.reviewCount || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ project: req.params.projectId, reviewer: req.user._id });
    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (review.reviewer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: 'Not authorized' });

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Not authorized' });

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (review.specialist.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: 'Only the specialist can respond' });

    review.response = { text, respondedAt: new Date() };
    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
