const AppError = require('../utils/appError');

const handleDbCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDbDuplicateFieldError = (err) => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please select another value`;
    return new AppError(message, 400);
};

const handleDbValidationError = (err) => {
    const errors = Object.values(err.errors).map((er) => er.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid token, Please log in again!', 401);
};

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired, Please log in again!', 401);
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

    if (process.env.NODE_ENV.trim() === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = { ...err };
        if (err.name === 'CastError') {
            error = handleDbCastError(error);
        } else if (err.code === 11000) {
            error = handleDbDuplicateFieldError(error);
        } else if (err.name === 'ValidationError') {
            error = handleDbValidationError(error);
        } else if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        } else if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        sendErrorProd(error, res); 
    }
};
