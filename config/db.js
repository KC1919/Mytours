const mongoose = require('mongoose');

exports.connectDb = () => {
    try {
        mongoose.connect(process.env.DB_URL.replace('<password>', process.env.DB_PASS));

        console.log('Connected to database successfully');
    } catch (error) {
        console.log('Failed to connect to database, server error', error.message);
    }
}