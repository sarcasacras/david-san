const dotenv = require('dotenv');

dotenv.config();

function requireAdmin(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/login');
    }
}

function authenticateAdmin(username, password) {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (username === adminUsername && password === adminPassword) {
        return true;
    } else {
        return false;
    }
}

module.exports = { authenticateAdmin, requireAdmin };