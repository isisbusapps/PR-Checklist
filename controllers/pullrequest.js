var express = require('express');
var router = express.Router();
var GitHubApi = require('octonode');

var github = GitHubApi.client(process.env.GH_ACCESS_TOKEN);

var buildChecklist = function(){
    var checklist = [
        "All tests are passing",
        "Any changes to webservices has been communicated to those who consume it",
        "Any relevant 'whats new' have been updated"
    ];
    var comment = "Please make sure the following are completed before merging:\n";

    checklist.forEach(function(item){
        comment += " - [ ] " + item + "\n";
    });

    return comment;
};

router.post('/pullrequest/', function(req, res){
    var payload = req.body.payload;
    console.log(payload);
    console.log(payload.action);
    var pr;
    if(payload.action === "opened"){
        console.log("New pull request for " + payload.repository.full_name);
        pr = github.issue(payload.repository.full_name, payload.pull_request.number);
        pr.createComment(
            {
                body: buildChecklist()
            },
            function(err, res){
                if(err) console.log(err);
                console.log("Created comment");
            }
        );
    }

    res.sendStatus(200);
});

module.exports = router;