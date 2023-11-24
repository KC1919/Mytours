const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const rateLimit = require('express-rate-limit');

dotenv.config({
    path: './config/.env',
});

app.use(express.json());

console.log(process.env.NODE_ENV);
// console.log(process.env);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from the same IP! Please try again in an hour.',
});

app.use('/api', limiter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// If the request did not match any of the routes int the above route handler
// that means that routed does not exists, so we return 404 Not Found!

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     message: `Cannot find ${req.originalUrl}`,
    //     success: false,
    // });

    // const err = new Error();

    // err.statusCode = 404;
    // err.message = `Cannot find ${req.originalUrl}`;
    // err.success = false;
    // next(err);

    const error = new AppError(`Cannot find ${req.originalUrl}`, 404);
    next(error); // if we pass an error in next handler it skips all the middlewares and
    // directly go to the error handler middleware
});

// error handler middleware
app.use(globalErrorHandler);

module.exports = app;
