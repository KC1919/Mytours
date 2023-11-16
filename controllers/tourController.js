const Tour = require('../models/Tours');

exports.createTour = async (req, res) => {
    try {
        const tour = await Tour.create(req.body);
        return res.status(201).json({
            message: "Tour created",
            success: true,
            data: {
                tour
            }
        });
    } catch (error) {
        console.log("Failed to create tour, server error", error);
        return res.status(500).json({
            message: 'Failed to create tour, server error',
            success: false,
            error: error.message
        })
    }
}

exports.getTours = async (req, res) => {
    try {

        console.log(req.query);

        //Building query
        const queryObj = {
            ...req.query
        };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //Advance filtering
        let queryStr = JSON.stringify(queryObj);

        // console.log(queryObj);
        // console.log(queryStr);

        //adding dollar sign in front of filter queries, like gte, lt, lte, gte
        //these if exists will become, $gt, $gte, $lt, $lte, so that it can be
        //passed as query parameter as mongoose query 
        queryStr = queryStr.replace(/\b(lte|gte|gt|lt)\b/g, match => `$${match}`);

        // console.log(queryStr);
        // console.log(queryObj);

        //Running the built query
        const query = Tour.find(JSON.parse(queryStr));

        const tours = await query;

        return res.status(200).json({
            message: "Tours data",
            success: true,
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch tours, server error',
            success: false,
            error: error.message
        })
    }
}

exports.getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        return res.status(200).json({
            message: "Tour data",
            success: true,
            data: {
                tour
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch tour, server error',
            success: false,
            error: error.message
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        return res.status(200).json({
            message: "Tour updated",
            success: true,
            data: {
                tour
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update tour, server error',
            success: false,
            error: error.message
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        return res.status(204).json({
            message: "Tour deleted",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete tour, server error',
            success: false,
            error: error.message
        })
    }
}