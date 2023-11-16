const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

dotenv.config({
    path: './config/.env'
});

app.use(express.json());

console.log(process.env.NODE_ENV);
// console.log(process.env);
if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
}

app.use(tourRouter);
app.use(userRouter);

module.exports = app;