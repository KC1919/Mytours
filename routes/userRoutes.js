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
    );

router
    .get('/', userController.getUsers)
    .patch('/updateMe', authController.protect, userController.updateMe)
    .delete('/deleteMe', authController.protect, userController.deleteMe);

module.exports = router;
