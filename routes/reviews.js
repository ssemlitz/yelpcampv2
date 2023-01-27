const express = require('express')
const router = express.Router({ mergeParams: true })
const reviews = require('../controllers/reviews')

// MODELS
const Campground = require('../models/campground')
const Review = require('../models/review')

// SCHEMA
const { reviewSchema } = require('../schemas.js')

// UTILITIES
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

// MIDDLEWARE
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router