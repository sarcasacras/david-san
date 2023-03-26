const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const Artwork = require('./models/artwork');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://127.0.0.1:27017/david-san')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

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

app.post('/artworks', (req, res) => {
    const newArtwork = new Artwork({
        title: req.body.title,
        image: req.body.image,
        description: req.body.description
    });

    newArtwork.save()
        .then(() => {
            res.redirect('/artworks');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error creating a new artwork');
        });
});

app.put('/artworks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, image, description } = req.body;

    try {
        const artwork = await Artwork.findById(id);
        if (!artwork) {
            return res.status(404).send('Artwork not found');
        }

        artwork.title = title;
        artwork.image = image;
        artwork.description = description;

        await artwork.save();

        res.redirect(`/artworks/${artwork._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/artworks/:id', (req, res) => {
    Artwork.findByIdAndDelete(req.params.id)
        .then(() => {
            res.redirect('/artworks')
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error deleting artwork');
        })
})

app.listen(3000, () => {
    console.log('Server started on port 3000')
})