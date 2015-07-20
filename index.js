require('dotenv').load();
var express = require('express');
var expressHbs = require('express-handlebars');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(expressSession({
    secret : process.env.SESSION_SECRET,
    cookie : {
        expires: false,
    },
    resave: true,
    saveUninitialized: true
}));
// Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GitHubStrategy({
        clientID: process.env.GH_KEY,
        clientSecret: process.env.GH_SECRET,
        callbackURL: '/auth/github/callback',
        scope: ['repo', 'write:repo_hook']
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, {profile: profile, token: accessToken});
    })
);
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// Render engine
app.engine('handlebars', expressHbs.create({defaultLayout:'main'}).engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

// Controllers
app.use(require('./controllers'));
app.use(require('./controllers/auth'));
app.use(require('./controllers/setup'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found (' + req.url + ')');
    err.status = 404;
    next(err);
});

// production error handler no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        status: err.status || 500,
        message: err.message,
        error: {}
    });
});

app.listen(port, function(){
    console.log('Listening on ' + port);
});