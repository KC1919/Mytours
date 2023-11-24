const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const signToken = (userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = await signToken(newUser._id);

    newUser.password = undefined;

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

    createSendToken(user, 200, res);
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

    // console.log(decoded);

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

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'User not authorized to perform this operation!',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Check if user exists
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('User with this email does not exist!', 404));
    }

    // 2) Generate reset token and save in user document

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    // 3) Send email

    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and confirm password to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email!`;

    try {
        await sendEmail({
            email: req.body.email,
            subject: 'Your password reset token, (valid for 10 min)!',
            message: message,
        });

        res.status(200).json({
            status: 'success',
            success: true,
            message: 'Token sent to email!',
        });
    } catch (error) {
        console.log(error);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'Failed to sent password reset email to user. Try again later!',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token.
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired and user exist, then set new password
    if (!user) {
        return next(new AppError('Reset token invalid or expired!', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in send JWT
    createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from the collection
    const user = await User.findById(req.user._id).select('+password');

    const currentPass = req.body.currentPassword;

    // 2) Check if is current password is correct or not
    if (!user || !(await user.checkPassword(currentPass, user.password))) {
        return next(new AppError('Wrong Password! Please try again.'));
    }

    // 3) if correct, update the user password with new password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Generate new JWT token and return it to the user
    createSendToken(user, 201, res);
});
