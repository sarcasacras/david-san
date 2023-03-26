const express = require('express');
const router = express.Router();
const Artwork = require('../models/artwork');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const updateArtwork = require('../middleware/updateArtwork');
const deleteArtwork = require('../middleware/deleteArtwork');
const newArtwork = require('../middleware/newArtwork');

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

router.get('/', (req, res) => {
    Artwork.find()
        .then((artworks) => {
            res.render('artworks', { artworks });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving artworks');
        })
})

router.get('/new', (req, res) => {
    res.render('new');
})

router.get('/:id', (req, res) => {
    Artwork.findById(req.params.id)
        .then((artwork) => {
            res.render('show', { artwork });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving artwork');
        });
});

router.get('/:id/edit', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        res.render('edit', { artwork });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

router.post('/', upload.single('image'), newArtwork);

router.put('/:id', upload.single('image'), updateArtwork);

router.delete('/:id', deleteArtwork);

module.exports = router;