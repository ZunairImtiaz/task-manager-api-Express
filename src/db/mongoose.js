const mongoose = require('mongoose');

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
        console.log('mongodb is connected on: ' + conn.connection.host);
    } catch (error) {
        console.log(error);
    }
}
module.exports = connectDB;