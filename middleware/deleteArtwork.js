const Artwork = require('../models/artwork');
const cloudinary = require('cloudinary').v2;

module.exports = async (req, res) => {
    const { id } = req.params;
    try {
        const artwork = await Artwork.findById(id);
        if (!artwork) {
            return res.status(404).send('Artwork not found');
        }
        if (artwork.cloudinaryId) {
            await cloudinary.uploader.destroy(artwork.cloudinaryId);
        }
        await Artwork.findByIdAndDelete(id);
        res.redirect('/artworks');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};