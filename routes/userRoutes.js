const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router
    .post('/signup', authController.signup)
    .post('/login', authController.login)
    .post('/forgotPassword', authController.forgotPassword)
    .patch('/resetPassword/:token', authController.resetPassword)
    .patch(
        '/updatePassword',
        authController.protect,
        authController.updatePassword
    )
    .patch('/updateMe', authController.protect, userController.updateMe);

router.route('/api/v1/user').get().post();

router.route('api/v1/user/:id').get().patch().delete();

module.exports = router;
