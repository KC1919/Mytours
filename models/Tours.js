const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'A tour name must be provided.']
    },
    duration: {
        type: Number,
        required: [true, 'A tour duration must be provided']
    },
    price: {
        type: Number,
        required: [true, 'A price must be provided for a tour']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A group size must be provided']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour diffculty must be provided.']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        required: [true, 'A tour summary must be provided.']
    },
    description: String,
    imageCover: {
        type: String,
        required: [true, 'An image cove for tour must be provided.']
    },
    images: [String],
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
}, {
    timestamps: true
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;