var mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
    username: String,
    current: { lat: Number, lng: Number },
    destination: { lat: Number, lng: Number },
});

module.exports = mongoose.model('Location', locationSchema);