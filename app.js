const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const Artwork = require('./models/artwork');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))

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

app.listen(3000, () => {
    console.log('Server started on port 3000')
})