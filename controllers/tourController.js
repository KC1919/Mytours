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

exports.createTour = catchAsync(async (req, res) => {
    // try {
        const tour = await Tour.create(req.body);
        return res.status(201).json({
            message: 'Tour created',
            success: true,
            data: {
                tour,
            },
        });
    // } catch (error) {
        // console.log('Failed to create tour, server error', error);
        // return res.status(500).json({
        //     message: 'Failed to create tour, server error',
        //     success: false,
        //     error: error.message,
        // });
    // }
});

exports.getTours = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch tours, server error',
            success: false,
            error: error.message,
        });
    }
};

exports.getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        return res.status(200).json({
            message: 'Tour data',
            success: true,
            data: {
                tour,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch tour, server error',
            success: false,
            error: error.message,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update tour, server error',
            success: false,
            error: error.message,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        return res.status(204).json({
            message: 'Tour deleted',
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete tour, server error',
            success: false,
            error: error.message,
        });
    }
};

exports.tourStats = async (req, res) => {
    try {
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
    } catch (error) {
        console.log('Failed to fetch stats!', error);
        res.status(500).json({
            message: error.message,
            success: false,
            error: error,
        });
    }
};

exports.monthlyPlan = async (req, res) => {
    try {
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
    } catch (error) {
        console.log('Failed to get monthly plan details!', error);
        res.status(500).json({
            message: 'Failed to get monthly plan details!',
            success: false,
            error: error.message,
        });
    }
};
