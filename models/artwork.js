const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: true
    }
});

const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = Artwork;

