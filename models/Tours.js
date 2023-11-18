const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: [true, 'A tour name must be provided.'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour duration must be provided'],
        },
        price: {
            type: Number,
            required: [true, 'A price must be provided for a tour'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A group size must be provided'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour diffculty must be provided.'],
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        summary: {
            type: String,
            required: [true, 'A tour summary must be provided.'],
        },
        description: String,
        imageCover: {
            type: String,
            required: [true, 'An image cove for tour must be provided.'],
        },
        images: [String],
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

// virtual property that is not saved in database, but only returned along
// with the result when there is a read operation
tourSchema.virtual('durationInWeeks').get(function () {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE

//pre save hook ony workes with "save" and "create" operations
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// QUERY MIDDLEWARE

//works for both findOne() and find()
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
    // this keyword in aggregate hook refers to the aggregate query object, so we also have
    // access to the aggregate pipeline array which contains multiple stages

    // we can add a stage to the aggregate pipeline before the main query
    // gets executed
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
});

// The hooks should always be defined before the Schema is modelled, else it will not work

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
