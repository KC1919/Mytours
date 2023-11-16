const Tour = require('../models/Tours');

exports.createTour = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
        return res.status(201).json({
            message: 'Tour created',
            success: true,
            data: {
                tour,
            },
        });
    } catch (error) {
        console.log('Failed to create tour, server error', error);
        return res.status(500).json({
            message: 'Failed to create tour, server error',
            success: false,
            error: error.message,
        });
    }
};

exports.getTours = async (req, res) => {
    try {
        console.log(req.query);

        //Build query

        //1. FILTERING
        let queryObj = {
            ...req.query,
        };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        //2. ADVANCE FILTERING
        let queryStr = JSON.stringify(queryObj);

        console.log(queryObj);
        // console.log(queryStr);

        //adding dollar sign in front of filter queries, like gte, lt, lte, gte
        //these if exists will become, $gt, $gte, $lt, $lte, so that it can be
        //passed as query parameter as mongoose query
        queryStr = queryStr.replace(
            /\b(lte|gte|gt|lt)\b/g,
            (match) => `$${match}`
        );

        // console.log(queryStr);

        queryObj = JSON.parse(queryStr);

        console.log(queryObj);

        //Running the built query
        let query = Tour.find(queryObj);

        //3. SORTING
        let sortBy;

        //if sort option is present as a query parameter, then rebuild the query with 
        //appropriate options

        if (req.query.sort) {
            sortBy = req.query.sort.split(',').join(' ');
            // console.log(sortBy);
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //4. LIMITING FIELDS
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v')
        }

        //5. PAGINATION

        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skipCount = (page - 1) * limit;

        query = query.skip(skipCount).limit(limit);

        if (req.query.page) {
            const totalNumTours = await Tour.countDocuments();
            if (skipCount >= totalNumTours) {
                throw new Error('Page does not exists!')
            }
        }

        //EXECUTING QUERY
        const tours = await query;

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