const cloudinary = require('cloudinary').v2;
const Artwork = require('../models/artwork');

module.exports = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, deleteImage } = req.body;
    let artwork;

    try {
        artwork = await Artwork.findById(id);
        if (!artwork) {
            return res.status(404).send('Artwork not found');
        }

        artwork.title = title;
        artwork.description = description;
        //Если пользователь отметил галочкой, что нынешнюю картинку надо удалить
        if (deleteImage) {
            await cloudinary.uploader.destroy(artwork.cloudinaryId);
            artwork.image = null;
            artwork.cloudinaryId = null;
        } 
        //Если пользователь выбрал новый файл
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { quality: 60, format: 'webp' });
            artwork.image = result.secure_url;
            artwork.cloudinaryId = result.public_id;
        }

        await artwork.save();
        res.redirect('/artworks');
    } catch (err) {
        console.error(err);
        //Действия с файлами на случай ошибки загрузки
        if (req.file) {
            await cloudinary.uploader.destroy(artwork.cloudinaryId);
            artwork.image = null;
            artwork.cloudinaryId = null;
            await artwork.save();
        }
        res.status(500).send('Server error');
    }
};