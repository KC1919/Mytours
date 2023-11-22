const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router
    .post('/signup', authController.signup)
    .post('/login', authController.login)

router.route('/api/v1/user').get().post();

router.route('api/v1/user/:id').get().patch().delete();

module.exports = router;
