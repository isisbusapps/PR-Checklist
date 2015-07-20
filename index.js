require('dotenv').load();
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
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


app.get("/", function(req, res){
	res.sendStatus(200);
});

app.listen(port, function(){
	console.log("Listening on " + port);
});