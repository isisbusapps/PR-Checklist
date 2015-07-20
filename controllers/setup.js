require('dotenv').load();
var GitHubApi = require('octonode');
var express = require('express');
var router = express.Router();
var isAuthenticated = require('../middleware').isAuthenticated;

var webhook_url = '';

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

router.post("/webhook", isAuthenticated, function(req, res){
	var repos = req.body.repos;
	var github = GitHubApi.client(req.user.token);
	var i = 0;
	repos.forEach(function(repoName){
		var repo = github.repo(repoName);
		repo.hooks(function(err, hooks){
			var hookExists = false;
			hooks.forEach(function(hook){
				if(hook.config.url === webhook_url){
					hookExists = true;
				}
			});

			if(!hookExists){
				repo.hook({
					name: "PR-Checklist",
					active: true,
					events: ["pull_request"],
					config: {
						url: webhook_url
					}
				}, function(err){
					if(err) console.log(err);

					if(++i === repos.length){
						return res.sendStatus(200);
					}
				});
			}
		});
	});
});

module.exports = router;