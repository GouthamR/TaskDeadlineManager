var express = require("express");
var app = express();

app.get('/', function(req, res)
{
	res.send("Index goes here.");
});

app.get('/calendar', function(req, res)
{
	res.send("Calendar goes here.");
});

var server = app.listen(3000, function()
{
	console.log("Listening...");
});
