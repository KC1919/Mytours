module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message;
    err.success = err.success;

    res.status(err.statusCode).json({
        message: err.message,
        success: err.success,
    });
};
