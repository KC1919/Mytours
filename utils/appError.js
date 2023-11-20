class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.success = `${statusCode}`.startsWith('4') ? 'false' : 'error';
        this.statusCode = statusCode;

        // Error.captureStackTrace()
    }
}

module.exports = AppError;
