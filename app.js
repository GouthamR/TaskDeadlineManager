var express = require("express");

var app = express();

var handlebars = require('express-handlebars').create(
{
	defaultLayout:'main',
	helpers:
	{
		// Implements sections in handlebars - for injecting content into
		// non-body areas of the template
		section: function(name, options)
		{
			if(!this._sections)
			{
				this._sections = {};
			}

			if(!this._sections[name])
			{
				this._sections[name] = options.fn(this);
			}
			else
			{
				this._sections[name] += options.fn(this);
			}
			return null;
		}
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.set("port", process.env.PORT || 3000);

app.use(require('body-parser').urlencoded({ extended: true }));

app.get('/', function(req, res)
{
	res.render("main");
});

app.get('/calendar', function(req, res)
{
	res.render("calendar");
});

app.get('/add-task', function(req, res)
{
	res.render("add-task");
});

app.get('/load-tasks', function(req, res)
{
	var tasks = require("./tasks.json");
	res.json(tasks);
});

app.get('/load-deadlines', function(req, res)
{
	var deadlines = require("./deadlines.json");
	res.json(deadlines);
});

app.post('/add-task', function(req, res)
{
	// STUB:
	console.log(req.body);
	res.redirect(303, '/');
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
