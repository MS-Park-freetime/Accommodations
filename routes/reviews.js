const express = require('express');
//app파일의 매개변수와 함께 현재 파일의 매개변수가 병합.
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//리뷰삭제
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;