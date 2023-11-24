const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

dotenv.config({
    path: './config/.env',
});

// Body parser, reading data from body into req.body
app.use(
    express.json({
        limit: '10kb',
    })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit number of requests from same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from the same IP! Please try again in an hour.',
});

app.use('/api', limiter);

// Add Security Headers
app.use(helmet());

// Protect against NoSQL query injection by sanitizing body params.
app.use(mongoSanitize());

// Protect agains XSS attack
app.use(xss());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// If the request did not match any of the routes int the above route handler
// that means that routed does not exists, so we return 404 Not Found!

app.all('*', (req, res, next) => {
    const error = new AppError(`Cannot find ${req.originalUrl}`, 404);
    next(error); // if we pass an error in next handler it skips all the middlewares and
    // directly go to the error handler middleware
});

// error handler middleware
app.use(globalErrorHandler);

module.exports = app;
