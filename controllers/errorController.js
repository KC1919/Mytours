const AppError = require('../utils/appError');

const handleDbCastError = (err, res) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        message: err.message,
        status: err.status,
        success: err.success,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // OPERATIONAL TRUSTED ERROR: send message to client

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            message: err.message,
            status: err.status,
        });

        // PROGRAMMING OR UNKNOWN ERROR: dont leak error details to client
    } else {
        //  1.) LOG ERROR
        console.log('ERROR: ', err);

        // 2.) SEND TO CLIENT
        return res.status(500).json({
            message: 'Something went wrong!',
            status: 'error',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // sendErrorDev(err, res);

    if (process.env.NODE_ENV.trim() === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = { ...err };
        // console.log(err.name);
        if (err.name === 'CastError') {
            error = handleDbCastError(error);
        }
        sendErrorProd(error, res);
    }
};
