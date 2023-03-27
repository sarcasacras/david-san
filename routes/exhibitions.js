const express = require('express');
const router = express.Router();
const Exhibition = require('../models/exhibition');
const Artwork = require('../models/artwork');

router.get('/', async (req, res) => {
    try {
        const exhibitions = await Exhibition.find().populate('artworks');
        res.render('exhibitions/index', { exhibitions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/new', async (req, res) => {
    try {
        const artworks = await Artwork.find({});
        res.render('exhibitions/new', { artworks: artworks });
    } catch (err) {
        console.log(err);
        res.redirect('/exhibitions');
    }
});

router.post('/', async (req, res) => {
    const { title, description, startDate, endDate, location, artworks } = req.body;
    const newExhibition = new Exhibition({
        title,
        description,
        startDate,
        endDate,
        location,
        artworks
    });
    try {
        await newExhibition.save();
        res.redirect('/exhibitions');
    } catch (err) {
        console.log(err);
        res.render('newExhibition', { exhibition: newExhibition, errorMessage: 'Error creating exhibition' });
    }
});

module.exports = router;