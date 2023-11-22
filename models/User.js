const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us you name.'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minLength: 8,
        select: false,
    },
    passwordConfirm: {
        // Only work on save or create operations
        type: String,
        required: [true, 'Please confirm your password!'],
        minLength: 8,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords do not match!',
        },
    },
    passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.checkPassword = async function (password, userPassword) {
    return await bcrypt.compare(password, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const passChangedTimeStamp = this.passwordChangedAt.getTime() / 1000;
        console.log(passChangedTimeStamp, JWTTimeStamp);
        return JWTTimeStamp < passChangedTimeStamp;
    }

    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
