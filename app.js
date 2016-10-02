var express = require("express");
var app = express();

app.set("port", process.env.PORT || 3000);

app.get('/', function(req, res)
{
	res.send("Index goes here.");
});

app.get('/calendar', function(req, res)
{
	res.send("Calendar goes here.");
});

var server = app.listen(app.get("port"), function()
{
	console.log("Listening on port " + app.get("port"));
});
