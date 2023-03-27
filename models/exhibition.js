const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    artworks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artwork'
    }]
});

const Exhibition = mongoose.model('Exhibition', exhibitionSchema);

module.exports = Exhibition;