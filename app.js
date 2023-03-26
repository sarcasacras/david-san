const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const Artwork = require('./models/artwork');
const methodOverride = require('method-override');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dbzohbxma',
    api_key: '289481138467442',
    api_secret: 'qZYY8DOSy2n3uoN8YrZ3uu_25b0'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://127.0.0.1:27017/david-san')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.', 400), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/artworks', (req, res) => {
    Artwork.find()
        .then((artworks) => {
            res.render('artworks', { artworks });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving artworks');
        })
})

app.get('/artworks/new', (req, res) => {
    res.render('new');
})

app.get('/artworks/:id', (req, res) => {
    Artwork.findById(req.params.id)
        .then((artwork) => {
            res.render('show', { artwork });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error retrieving artwork');
        });
});

app.get('/artworks/:id/edit', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        res.render('edit', { artwork });
    } catch (err) {
        console.log(err);
        res.redirect('/artworks');
    }
});

app.post('/artworks', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const image = req.file.path;

    cloudinary.uploader.upload(image)
        .then((result) => {
            const newArtwork = new Artwork({
                title,
                description,
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
            res.status(500).send('Error creating a new artwork');
        });
});

app.put('/artworks/:id', upload.single('image'), async (req, res) => {
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
        if (deleteImage) {
            await cloudinary.uploader.destroy(artwork.cloudinaryId);
            artwork.image = null;
            artwork.cloudinaryId = null;
        } else if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            artwork.image = result.secure_url;
            artwork.cloudinaryId = result.public_id;
        }
        await artwork.save();
        res.redirect(`/artworks/${artwork._id}`);
    } catch (err) {
        console.error(err);
        if (req.file) {
            await cloudinary.uploader.destroy(artwork.cloudinaryId);
            artwork.image = null;
            artwork.cloudinaryId = null;
            await artwork.save();
        }
        res.status(500).send('Server error');
    }
});

app.delete('/artworks/:id', async (req, res) => {
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
});

app.listen(3000, () => {
    console.log('Server started on port 3000')
})