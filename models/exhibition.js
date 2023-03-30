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
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    }]
});

const Exhibition = mongoose.model('Exhibition', exhibitionSchema);

module.exports = Exhibition;