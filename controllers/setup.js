require('dotenv').load();
var GitHubApi = require('octonode');
var express = require('express');
var router = express.Router();
var isAuthenticated = require('../middleware').isAuthenticated;

router.get("/setup", isAuthenticated, function(req, res){

});

module.exports = router;