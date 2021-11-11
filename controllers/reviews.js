const Museum = require('../models/museums');
const Review = require('../models/review')

module.exports.newReview = async (req, res) => {
    const museum = await Museum.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    museum.reviews.push(review);
    await review.save();
    await museum.save();
    req.flash('success', `Successfully added Review!`);
    res.redirect(`/museums/${museum._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Museum.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', `Successfully deleted Museum!`);
    res.redirect(`/museums/${id}`);
}