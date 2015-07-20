require('dotenv').load();
var GitHubApi = require('octonode');
var express = require('express');
var router = express.Router();
var isAuthenticated = require('../middleware').isAuthenticated;

router.get("/setup", isAuthenticated, function(req, res){
    var github = GitHubApi.client(req.user.token);
    var me = github.me();
    var orgsArr = [];
    var i = 0;
    // Get all user's own repos
    me.repos(function(err, repos){
    	var repoArr = [];
        repos.forEach(function(repo){
            repoArr.push(repo.full_name);
        });
        orgsArr.push({
            name: req.user.profile.username,
            repos: repoArr
        });
        i++;
    });
    // Fetch all orgs repos
    me.orgs(function(err, orgs){
        if(err){
            console.log(err);
            res.sendStatus(err.statusCode);
            return;
        }
        orgs.forEach(function(org){
            var ghOrg = github.org(org.login);
            ghOrg.repos(function(err, repos){
                var repoArr = [];
                repos.forEach(function(repo){
                    repoArr.push(repo.full_name);
                });
                orgsArr.push({
                    name: org.login,
                    repos: repoArr
                });
                if(++i === (orgs.length+1)){
                	res.render('setup', {orgs: orgsArr});
                }
            });
        });
    })
});

module.exports = router;