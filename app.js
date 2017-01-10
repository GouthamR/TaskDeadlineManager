var express = require("express");
var mongodb = require('mongodb');

var routes = require("./routes");

var dbConfig;
if(process.env.MONGO_URL) // if has heroku config variable
{
	dbConfig = 
	{
		url: process.env.MONGO_URL
	};
}
else // if heroku config not found
{
	// attempt to use config json file:
	// config file format: {"url":"mongodb://..."}
	dbConfig = require('./dbConfig.json');
}

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

app.set("port", process.env.PORT || 3000);

mongodb.MongoClient.connect(dbConfig.url, function(error, db)
{
	if(error)
	{
		console.log("Error connecting to database:");
		console.log(error);
	}
	else
	{
		console.log("Connected to db");

		routes.config(app, db);

		app.listen(app.get("port"), function()
		{
			console.log("Listening on port " + app.get("port"));
		});
	}
});