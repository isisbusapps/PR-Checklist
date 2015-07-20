require('dotenv').load();
var GitHubApi = require('octonode');
var express = require('express');
var router = express.Router();
var isAuthenticated = require('../middleware').isAuthenticated;

var webhook_url = process.env.WEBHOOK_URL;

function doesWebHookExist(hooks){
	var hookExists = false;

	hooks.forEach(function(hook){
		if(hook.config.url === webhook_url){
			console.log('Hook already exists');
			hookExists = true;
		}
	});

	return hookExists;
}

router.get("/setup", isAuthenticated, function(req, res){
    var github = GitHubApi.client(req.user.token);
    var me = github.me();
    var orgs = {};
    var i = 0, repoCount = 0;

    function repoDone(){
    	if(++i >= repoCount) {
    		return res.render('setup', {orgs: orgs});
    	}
    }

    // Get all user's own repos
    me.repos({ per_page: 200 }, function(err, repos){
    	repoCount = repos.length;
        repos.forEach(function(repo){
            if(repo.permissions.admin){
            	var ghRepo = github.repo(repo.full_name);
            	ghRepo.hooks(function(err, hooks){
            		if(!doesWebHookExist(hooks)){
			            if(!orgs[repo.owner.login]){
			            	orgs[repo.owner.login] = [];
			            }
		            	orgs[repo.owner.login].push(repo.full_name);

            		}
        			repoDone();
            	});
	        }else{
	        	repoDone();
	        }
        });
    });
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
			var hookExists = doesWebHookExist(hooks);

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