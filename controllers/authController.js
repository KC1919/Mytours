const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const signToken = async (userId) => {
    const token = await jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        message: 'User created',
        status: 'pass',
        success: true,
        token: token,
        data: {
            newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password are provided

    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // Check if user exist
    const user = await User.findOne({ email: email }).select('+password');

    // Check if password is correct or not

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('Incorrect email or Password!', 401));
    }

    const token = await signToken(user._id);

    res.status(200).json({
        status: 'pass',
        success: true,
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1) GETTING TOKEN & CHECK IF ITS THERE
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
        // console.log(token);
    } else {
        return next(
            new AppError(
                'User not Authorized! Please login or signup to continue!',
                401
            )
        );
    }

    // 2) Verification Token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    // 3) Check if user still exist.

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token no longer exist!',
                400
            )
        );
    }

    // 4) Check if user changed password after the token was issued.

    const changedPass = currentUser.changedPasswordAfter(decoded.iat);

    if (changedPass) {
        return next(
            new AppError('User changed password, Please log in again!', 401)
        );
    }

    req.user = currentUser;
    next();
});
