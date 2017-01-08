var express = require("express");
var mongodb = require('mongodb');

var routes = require("./routes");

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

app.use(require('body-parser').urlencoded({ extended: true }));

var dbConfig = require('./dbConfig.json');
var mongoServer = new mongodb.Server(dbConfig.url, parseInt(dbConfig.port));
var db = new mongodb.Db(dbConfig.name, mongoServer, { w: 1 });
db.open(function()
{
	console.log("Connected to db");
});

routes.config(app, db); // ok to config before db is loaded (but not ok to go to routes before db is loaded)

app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get("port"), function()
{
	console.log("Listening on port " + app.get("port"));
});
