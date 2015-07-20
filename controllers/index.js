var express = require('express');
var router = express.Router();

router.get('*', function(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }

    return next();
});

router.get('/', function(req, res){
    res.render('index');
});

module.exports = router;