const AppError = require('./appError');
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) =>
            next(new AppError('Failed to create tour', 500))
        );
    };
};
