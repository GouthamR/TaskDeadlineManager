var express = require("express");

var app = express();

var handlebars = require('express-handlebars').create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.set("port", process.env.PORT || 3000);

app.get('/', function(req, res)
{
	res.render("index", {layout: null});
});

app.get('/calendar', function(req, res)
{
	res.render("calendar");
});

app.use(function(req, res)
{
	res.status(404);
	res.render("404");
});

app.use(function(err, req, res, next)
{
	console.error(err.stack);
	res.status(500);
	res.render("500");
});

var server = app.listen(app.get("port"), function()
{
	console.log("Listening on port " + app.get("port"));
});
