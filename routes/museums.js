const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const museums = require('../controllers/museums');
const Museum = require('../models/museums');
const { isLoggedIn, isAuthor, validateMuseum } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get(museums.index)
    .post(isLoggedIn, upload.array('image'), validateMuseum, catchAsync(museums.createMuseum));



router.get('/new', isLoggedIn, museums.renderNewForm)

router.route('/:id')
    .get(catchAsync(museums.showMuseum))
    .put(isLoggedIn, upload.array('image'), validateMuseum, isAuthor, catchAsync(museums.updateMuseum))
    .delete(isLoggedIn, isAuthor, catchAsync(museums.deleteMuseum));




router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(museums.renderEditForm))





module.exports = router;