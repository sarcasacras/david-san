const Artwork = require('../models/artwork');
const cloudinary = require('cloudinary').v2;

module.exports = (req, res) => {
    const { title, description } = req.body;
    const image = req.file.path;

    //Загрузка на Cloudinary + сжатие
    cloudinary.uploader.upload(image, { quality: 40, format: 'webp' })
        .then((result) => {
            const newArtwork = new Artwork({
                title,
                description,
                //Ссылка и ID, которые возвращает Cloudinary
                //присваиваем их полям в базе данных
                image: result.secure_url,
                cloudinaryId: result.public_id,
            });
            return newArtwork.save();
        })
        .then(() => {
            res.redirect('/artworks');
        })
        .catch((err) => {
            console.log(err);
            cloudinary.uploader.destroy(req.file.filename.split(".")[0]);
            res.status(500).send('Error creating a new artwork');
        });
};