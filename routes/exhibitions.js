const express = require('express');
const router = express.Router();
const Exhibition = require('../models/exhibition');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const methodOverride = require('method-override');
const auth = require('../middleware/auth');
const session = require('express-session');

cloudinary.config({
    cloud_name: 'dbzohbxma',
    api_key: '289481138467442',
    api_secret: 'qZYY8DOSy2n3uoN8YrZ3uu_25b0'
});

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.use(methodOverride('_method'));

router.get('/', async (req, res, next) => {
    try {
        const exhibitions = await Exhibition.find();
        res.render('exhibitions/index', { exhibitions });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/new', auth.requireAdmin, (req, res) => {
    res.render('exhibitions/new');
});

router.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images' }]), auth.requireAdmin, async (req, res) => {
    const { title, shortDescription, description } = req.body;
    const images = [];
    let thumbnail;

    try {
        for (const file of req.files.images) {
            const result = await cloudinary.uploader.upload(file.path, { quality: 80, format: 'webp' });
            images.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }

        if (req.files.thumbnail) {
            const thumbnailFile = req.files.thumbnail[0];
            const thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, { quality: 80, format: 'webp' });
            thumbnail = {
                url: thumbnailResult.secure_url,
                publicId: thumbnailResult.public_id
            }
        }

        const newExhibition = new Exhibition({
            title,
            shortDescription,
            description,
            thumbnail,
            images
        });

        await newExhibition.save();

        res.redirect('/exhibitions');
    } catch (err) {
        console.error(err);

        for (const image of images) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        if (thumbnail) {
            await cloudinary.uploader.destroy(thumbnail.publicId);
        }

        res.render('exhibitions/new', {
            exhibition: newExhibition,
            errorMessage: 'Error creating exhibition'
        });
    }
});

router.get('/:id/edit', auth.requireAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
        const exhibition = await Exhibition.findById(id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }
        res.render('exhibitions/edit', { exhibition });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }
        res.render('exhibitions/show', { exhibition, session: req.session });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.put('/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images' }]), auth.requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, shortDescription, description, deleteImages, deleteThumbnail } = req.body;
    const newImages = [];
    let newThumbnail;

    try {
        const exhibition = await Exhibition.findById(id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }

        // Delete selected images from Cloudinary
        if (deleteImages && deleteImages.length > 0) {
            for (const publicId of deleteImages) {
                await cloudinary.uploader.destroy(publicId);
                exhibition.images = exhibition.images.filter(image => image.publicId !== publicId);
            }
        }

        // Delete thumbnail from Cloudinary if requested
        if (deleteThumbnail) {
            await cloudinary.uploader.destroy(exhibition.thumbnail.publicId);
            exhibition.thumbnail = null;
        }

        // Upload new thumbnail to Cloudinary
        if (req.files.thumbnail) {
            const thumbnailFile = req.files.thumbnail[0];
            const thumbnailResult = await cloudinary.uploader.upload(thumbnailFile.path, { quality: 80, format: 'webp' });
            newThumbnail = {
                url: thumbnailResult.secure_url,
                publicId: thumbnailResult.public_id
            };
            exhibition.thumbnail = newThumbnail;
        }

        // Upload new images to Cloudinary
        if (req.files.images) {
            for (const file of req.files.images) {
                const result = await cloudinary.uploader.upload(file.path, { quality: 80, format: 'webp' });
                newImages.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        }

        exhibition.title = title;
        exhibition.shortDescription = shortDescription;
        exhibition.description = description;
        exhibition.images.push(...newImages);

        await exhibition.save();

        res.redirect(`/exhibitions/${id}`);
    } catch (err) {
        console.error(err);

        for (const image of newImages) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        if (newThumbnail) {
            await cloudinary.uploader.destroy(newThumbnail.publicId);
        }

        res.redirect('/exhibitions');
    }
});



router.delete('/:id', auth.requireAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
        const exhibition = await Exhibition.findById(id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }

        // Delete thumbnail from Cloudinary if it exists
        if (exhibition.thumbnail) {
            await cloudinary.uploader.destroy(exhibition.thumbnail.publicId);
        }

        // Delete images from Cloudinary
        for (const image of exhibition.images) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        await Exhibition.findByIdAndDelete(id);
        res.redirect('/exhibitions');
    } catch (err) {
        console.error(err);
        next(err);
    }
});


module.exports = router;