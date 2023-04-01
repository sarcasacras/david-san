const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    thumbnail: {
        url: {
            type: String,
            required: false
        },
        publicId: {
            type: String,
            required: false
        }
    },
    images: [{
        url: {
            type: String,
            required: false
        },
        publicId: {
            type: String,
            required: false
        }
    }]
});

const Exhibition = mongoose.model('Exhibition', exhibitionSchema);

module.exports = Exhibition;