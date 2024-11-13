const mongoose = require('mongoose');

function connectDB(connectionURL) {
    return mongoose.connect(connectionURL);
}

module.exports = connectDB;