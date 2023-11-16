const app = require('./app');
const {
    connectDb
} = require('./config/db');

connectDb();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});