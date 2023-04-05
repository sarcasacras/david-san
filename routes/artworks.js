const express = require('express');
const router = express.Router();
const Artwork = require('../models/artwork');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const updateArtwork = require('../middleware/updateArtwork');
const deleteArtwork = require('../middleware/deleteArtwork');
const newArtwork = require('../middleware/newArtwork');
const auth = require('../middleware/auth');
const session = require('express-session');

//Эти данные должны потом находится в .env файле
cloudinary.config({
    cloud_name: 'dbzohbxma',
    api_key: '289481138467442',
    api_secret: 'qZYY8DOSy2n3uoN8YrZ3uu_25b0'
});

//Конфигурация названия файла. 
//Я не использовал просто оригинальное имя файла, но с Cloudinary это больше не является проблемой, 
//тем более когда мы загружаем по одной картинке
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

//Эту штуку в доках отрыл, проверяет, отправляет ли пользователь картинку, а не другую ебалу
const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.', 400), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', async (req, res, next) => {
    try {
        const artworks = await Artwork.find();
        res.render('artworks', { artworks, session: req.session });
    } catch (err) {
        console.log(err);
        next(err); // Pass the error to the error handling middleware
    }
});

router.get('/new', auth.requireAdmin, (req, res) => {
    res.render('new');
})

router.get('/:id/edit', auth.requireAdmin, async (req, res, next) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        res.render('edit', { artwork });
    } catch (err) {
        console.log(err);
        next(err); // Pass the error to the error handling middleware
    }
});

router.post('/', upload.single('image'), auth.requireAdmin, newArtwork);

router.put('/:id', upload.single('image'), auth.requireAdmin, updateArtwork);

router.delete('/:id', auth.requireAdmin, deleteArtwork);

module.exports = router;