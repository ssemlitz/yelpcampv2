const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const campgrounds = require('../controllers/campgrounds')

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

router.route('/')
    .get('/', catchAsync(campgrounds.index))
    .post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get('/:id', catchAsync(campgrounds.showCampground))
    .put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, catchAsync(campgrounds.renderEditForm))





module.exports = router