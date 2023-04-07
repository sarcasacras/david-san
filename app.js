const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const artworksRouter = require('./routes/artworks');
const exhibitionsRouter = require('./routes/exhibitions');
const auth = require('./middleware/auth');
const session = require('express-session');
const helmet = require('helmet');


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
app.use(helmet());

mongoose.connect(process.env.MONGO_URL)
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

// 404 error handler
app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';
    console.error(`[${new Date().toISOString()}] ${status} ${errorMessage}`);
    res.status(status);
    res.render(`errors/${status}`, { error: errorMessage });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});