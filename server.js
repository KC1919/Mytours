process.on('uncaughtException', (err) => {
    console.log('Unncaught Exception!');
    console.log(err.name + '-' + err.message);
    process.exit(1);
});

const app = require('./app');
const { connectDb } = require('./config/db');

connectDb();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection! Server shutting down...');
    console.log(err.name + '-' + err.message);
    server.close(() => {
        process.exit(1);
    });
});
