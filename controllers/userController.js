const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const AppError = require('../utils/appError');

const filterObj = (obj, ...fields) => {
    let newObject = {};
    Object.keys(obj).forEach((el) => {
        if (fields.includes(el)) {
            newObject[el] = obj[el];
        }
    });

    return newObject;
};

exports.getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        success: true,
        data: {
            users,
        },
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // If user POSTed password with update request, return an error
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'Cannot update password using this request! Please update passsword using /api/v1/updatePassword request'
            )
        );
    }

    const filteredObject = filterObj(req.body, 'email', 'name');

    // console.log(filteredObject);

    const user = await User.findByIdAndUpdate(req.user._id, filteredObject, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        message: 'User data updated successfully!',
        success: true,
        status: 'success',
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
        message: 'Profile deleted!',
        success: true,
        status: 'success',
    });
});
