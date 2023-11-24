const Tour = require('../models/Tours');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.createAlias = (req, res, next) => {
    try {
        req.query.limit = '5';
        req.query.sort = '-ratingsAverage,price';
        req.query.fields = 'name,duration,diffculty,price,ratingsAverage';
        next();
    } catch (error) {
        console.log('Failed to create alias');
    }
};

exports.createTour = catchAsync(async (req, res, next) => {
    // try {
    const tour = await Tour.create(req.body);
    return res.status(201).json({
        message: 'Tour created',
        success: true,
        status: 'pass',
        data: {
            tour,
        },
    });
});

exports.getTours = catchAsync(async (req, res, next) => {
    // try {
    console.log(req.query);

    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    //EXECUTING QUERY
    const tours = await features.query;

    return res.status(200).json({
        message: 'Tours data',
        success: true,
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTourById = catchAsync(async (req, res, next) => {
    // try {
    const tour = await Tour.findById(req.params.id);

    if (tour !== null) {
        return res.status(200).json({
            message: 'Tour data',
            success: true,
            data: {
                tour,
            },
        });
    } else {
        return res.status(404).json({
            message: 'Tour not found!',
            success: false,
            status: 'fail',
        });
    }
});

exports.updateTour = catchAsync(async (req, res, next) => {
    // try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    return res.status(200).json({
        message: 'Tour updated',
        success: true,
        data: {
            tour,
        },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    // try {
    await Tour.findByIdAndDelete(req.params.id);
    return res.status(204).json({
        message: 'Tour deleted',
        success: true,
    });
});

exports.tourStats = catchAsync(async (req, res, next) => {
    // try {
    const stats = await Tour.aggregate([
        {
            $match: {
                ratingsAverage: {
                    $gte: 4.5,
                },
            },
        },
        {
            $group: {
                _id: {
                    $toUpper: '$difficulty',
                },
                numRatings: {
                    $sum: '$ratingsQuantity',
                },
                numTours: {
                    $sum: 1,
                },
                avgRating: {
                    $avg: '$ratingsAverage',
                },
                avgPrice: {
                    $avg: '$price',
                },
                minPrice: {
                    $min: '$price',
                },
                maxPrice: {
                    $max: '$price',
                },
            },
        },
        {
            $sort: {
                avgPrice: 1,
            },
        },
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats,
        },
    });
});

exports.monthlyPlan = catchAsync(async (req, res, next) => {
    // try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: {
                    $month: '$startDates',
                },
                numTours: {
                    $sum: 1,
                },
                tours: {
                    $push: '$name',
                },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $sort: {
                numTours: -1,
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);

    res.status(200).json({
        success: true,
        results: plan.length,
        data: {
            plan,
        },
    });
});
