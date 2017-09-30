var express = require("express");
var path = require('path');
var session = require('express-session');
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
	dbConfig = require('./dbConfig.json');
}

var oauthConfig;
if(process.env.SESSION_SECRET) // if has heroku config variable
{
	oauthConfig = 
	{
		sessionSecret: process.env.SESSION_SECRET,
		google:
		{
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authUri: process.env.GOOGLE_AUTH_URI,
			tokenUri: process.env.GOOGLE_TOKEN_URI,
			revokeUri: process.env.GOOGLE_REVOKE_URI,
			redirectUri: process.env.GOOGLE_REDIRECT_URI
		}
	};
}
else
{
	// attempt to use config json file:
	oauthConfig = require('./oauthConfig.json');
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
			else if(!this._links.includes(newLink)) // only add each link once - to avoid unnecessary duplicate links
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

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('body-parser').urlencoded({ extended: true }));

app.set("port", process.env.PORT || 3000);

if(app.get('env') == 'production')
	app.set('trust proxy', 1);

app.use(session({
	secret: oauthConfig.sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: (app.get('env') == 'production'),
		maxAge: 5 * 60 * 1000 // five minutes. Note: to make cookies persist across server restarts, need to have express session store in e.g. mongodb
	}
}));

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

		routes.config(app, db, oauthConfig);

		app.listen(app.get("port"), function()
		{
			console.log("Listening on port " + app.get("port"));
		});
	}
});