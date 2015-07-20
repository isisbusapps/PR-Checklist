var express = require('express');
var router = express.Router();
var passport = require('passport');

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
router.get(
    '/auth/github',
    passport.authenticate('github')
);

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get(
    '/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect(req.session.redirectTo || '/');
    }
);

router.get('/accessToken', function(req, res) {
    if (req.isAuthenticated()) {
        res.send(req.user.token);
    } else {
        res.sendStatus(403);
    }
});

router.get('/logout', function(req, res) {
    req.logout();
    res.render('logout');
});

router.get('/login', function(req, res) {
    res.redirect('/auth/github');
});

module.exports = router;
