const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const artworksRouter = require('./routes/artworks');
const exhibitionsRouter = require('./routes/exhibitions');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use('/artworks', artworksRouter);
app.use('/exhibitions', exhibitionsRouter);

mongoose.connect('mongodb://127.0.0.1:27017/david-san')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(3000, () => {
    console.log('Server started on port 3000')
})