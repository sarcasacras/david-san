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

router.get('/', async (req, res) => {
    try {
        const exhibitions = await Exhibition.find();
        res.render('exhibitions/index', { exhibitions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/new', auth.requireAdmin, (req, res) => {
    res.render('exhibitions/new');
});

router.post('/', upload.array('images'), auth.requireAdmin, async (req, res) => {
    const { title, description } = req.body;
    const images = [];

    try {
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, { quality: 80, format: 'webp' });
            images.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }

        const newExhibition = new Exhibition({
            title,
            description,
            images
        });

        await newExhibition.save();

        res.redirect('/exhibitions');
    } catch (err) {
        console.error(err);

        for (const image of images) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        res.render('exhibitions/new', {
            exhibition: newExhibition,
            errorMessage: 'Error creating exhibition'
        });
    }
});

router.get('/:id/edit', auth.requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const exhibition = await Exhibition.findById(id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }
        res.render('exhibitions/edit', { exhibition });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error!');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }
        res.render('exhibitions/show', { exhibition });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});




router.put('/:id', upload.array('images'), auth.requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, deleteImages } = req.body;
    const newImages = [];

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

        // Upload new images to Cloudinary
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, { quality: 80, format: 'webp' });
            newImages.push({
                url: result.secure_url,
                publicId: result.public_id
            });
        }

        exhibition.title = title;
        exhibition.description = description;
        exhibition.images.push(...newImages);

        await exhibition.save();

        res.redirect(`/exhibitions/${id}`);
    } catch (err) {
        console.error(err);

        for (const image of newImages) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        res.render('exhibitions/edit', {
            exhibition: { ...exhibition, title, description },
            errorMessage: 'Error updating exhibition'
        });
    }
});

router.delete('/:id', auth.requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const exhibition = await Exhibition.findById(id);
        if (!exhibition) {
            return res.status(404).send('Exhibition not found');
        }
        for (const image of exhibition.images) {
            await cloudinary.uploader.destroy(image.publicId);
        }
        await Exhibition.findByIdAndDelete(id);
        res.redirect('/exhibitions');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;