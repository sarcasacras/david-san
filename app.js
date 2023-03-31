const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const artworksRouter = require('./routes/artworks');
const exhibitionsRouter = require('./routes/exhibitions');
const auth = require('./middleware/auth');
const session = require('express-session');
const Exhibition = require('./models/exhibition');

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}));

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
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (auth.authenticateAdmin(username, password)) {
        req.session.admin = true;
        res.redirect('/');
    } else {
        res.send('Wrong password or username');
    }
});

app.get('/logout', (req, res) => {
    req.session.admin = false;
    res.redirect('/'); //redirect to the previous page
});

app.get('/contacts', (req, res) => {
    res.render('contacts');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});