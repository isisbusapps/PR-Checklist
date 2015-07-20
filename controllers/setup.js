require('dotenv').load();
var GitHubApi = require('octonode');
var express = require('express');
var router = express.Router();
var isAuthenticated = require('../middleware').isAuthenticated;

var webhook_url = process.env.WEBHOOK_URL;

router.get("/setup", isAuthenticated, function(req, res){
    var github = GitHubApi.client(req.user.token);
    var me = github.me();
    var orgsArr = [];
    var i = 0;

    // Get all user's own repos
    me.repos(function(err, repos){
    	var repoArr = [];
        repos.forEach(function(repo){
            if(repo.permissions.admin){
	            repoArr.push(repo.full_name);
	        }
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
            return res.sendStatus(err.statusCode);
        }
        orgs.forEach(function(org){
            var ghOrg = github.org(org.login);
            ghOrg.repos(function(err, repos){
                var repoArr = [];
                repos.forEach(function(repo){
                	if(repo.permissions.admin){
	                    repoArr.push(repo.full_name);
	                }
                });
                if(repoArr.length){
                	orgsArr.push({
	                    name: org.login,
	                    repos: repoArr
	                });
                }

                // Completed
                if(++i === (orgs.length+1)){
                	res.render('setup', {orgs: orgsArr});
                }
            });
        });
    })
});

router.post("/setup/webhooks", isAuthenticated, function(req, res){
	var repos = req.body.repos;
	var github = GitHubApi.client(req.user.token);
	var i = 0;
	repos.forEach(function(repoName){
		var repo = github.repo(repoName);
		repo.hooks(function(err, hooks){
			if(err){
				console.log("Error getting hooks");
				console.log(err);
				return res.sendStatus(500);
			}
			var hookExists = false;

			hooks.forEach(function(hook){
				if(hook.config.url === webhook_url){
					console.log('Hook already exists');
					hookExists = true;
				}
			});

			if(!hookExists){
				console.log('About to create web hook');
				repo.hook({
					name: 'web',
					active: true,
					events: ['pull_request'],
					config: {
						url: webhook_url
					}
				}, function(err){
					if(err) console.log(err.body.errors);

					if(++i === repos.length){
						return res.sendStatus(200);
					}
				});
			}
		});
	});
});

module.exports = router;