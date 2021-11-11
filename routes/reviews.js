const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Museum = require('../models/museums');
const Review = require('../models/review')
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const reviews = require('../controllers/reviews');




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.newReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;