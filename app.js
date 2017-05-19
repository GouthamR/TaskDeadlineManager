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
		// Adds to the _links array, which is used by the printLinks helper.
		addLink: function(options)
		{
			var newLink = options.fn(this);
			if(!this._links)
			{
				this._links = [newLink];
			}
			else
			{
				this._links.push(newLink);
			}
			return null; // to prevent the link from being output in the invoking file
		},
		// Prints the links in the _links array.
		printLinks: function(options)
		{
			var linksText = "";
			if(this._links)
			{
				this._links.forEach(function(currLink)
				{
					linksText += currLink;
				}, this);
			}
			return linksText;
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