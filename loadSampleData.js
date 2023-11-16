const Tour = require('./models/Tours');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({
    path: './config/.env'
});

mongoose.connect(process.env.DB_URL.replace('<password>', process.env.DB_PASS));

const tours = JSON.parse(fs.readFileSync('./data/tour-sample-data.json', 'utf-8'));

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log("Data loaded successfully!");
    } catch (error) {
        console.log("Failed to load data", error);
    }
    process.exit();
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Data deleted successfully!");
    } catch (error) {
        console.log("Failed to delete data", error);
    }
    process.exit();
}

if (process.argv[2] === '--delete') {
    deleteData();
} else if (process.argv[2] === '--import') {
    importData();
}

console.log(process.argv);