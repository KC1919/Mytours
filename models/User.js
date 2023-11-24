const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us you name.'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email.'],
            unique: true,
            validate: [validator.isEmail, 'Please provide a valid email!'],
            lowercase: true,
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user',
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
                // This only works on CREATE and SAVE!!!
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Passwords do not match!',
            },
        },
        passwordChangedAt: Date,
        passwordResetToken: {
            type: String,
        },
        passwordResetExpires: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    // subtracting 1000 ms i.e equal to 1 second, because sometimes, JWT token is generated before
    // and password changed at time is updated after, so the password changed at time can
    // be greater than JWT issued time, so in that case our token will be termed invalid
    // so to prevent that, we add a margin of 1 second to password changedAt time
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.checkPassword = async function (password, userPassword) {
    // console.log(password, userPassword);
    return await bcrypt.compare(password, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const passChangedTimeStamp = this.passwordChangedAt.getTime() / 1000;
        return JWTTimeStamp < passChangedTimeStamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log(resetToken, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
