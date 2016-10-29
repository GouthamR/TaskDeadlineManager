var express = require("express");

var app = express();

var handlebars = require('express-handlebars').create(
{
	defaultLayout:'main',
	helpers:
	{
		section: function(name, options)
		{
            if(!this._sections)
            {
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        }
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.set("port", process.env.PORT || 3000);

app.get('/', function(req, res)
{
	res.render("index");
});

app.get('/calendar', function(req, res)
{
	res.render("calendar");
});

app.get('/load-tasks', function(req, res)
{
	// STUB:

	var tasks = 
	[
		{
			"title":"Clean Room",
			"startEpochMillis": "1477683051161", 
			"endEpochMillis": "1477686651161",
			"isAllDay":"false"
		},
		{
			"title":"Math HW",
			"startEpochMillis": "1477709571161", 
			"endEpochMillis": "1477709571161",
			"isAllDay":"false"
		},
		{
			"title":"Lunch",
			"startEpochMillis": "1477702851161", 
			"endEpochMillis": "1477722651161",
			"isAllDay":"false"
		},
		{
			"title":"End Poverty",
			"startEpochMillis": "1477709571161", 
			"endEpochMillis": "1477709571161",
			"isAllDay":"true"
		},
		{
			"title":"Game of Thrones Marathon",
			"startEpochMillis": "1477708251161", 
			"endEpochMillis": "1477711851161",
			"isAllDay":"false"
		},
		{
			"title":"Solve the Water Stagnation Problem",
			"startEpochMillis": "1477708251161", 
			"endEpochMillis": "1477711851161",
			"isAllDay":"true"
		},
		{
			"title":"Dinner",
			"startEpochMillis": "1477708251161", 
			"endEpochMillis": "1477711851161",
			"isAllDay":"false"
		}
	];
	res.json(tasks);
});

app.get('/load-deadlines', function(req, res)
{
	// STUB:

	var deadlines = 
	[
		{
			"title": "English Paper",
			"startEpochMillis": "1477711778000",
			"isAllDay": "false"
		},
		{
			"title": "Game of Thrones Seasons 1-8 Due",
			"startEpochMillis": "1460462400000",
			"isAllDay": "false"
		},
		{
			"title": "Math HW Due",
			"startEpochMillis": "1474329600000",
			"isAllDay": "true"
		},
		{
			"title": "Cure to Cancer Due",
			"startEpochMillis": "1480032000000",
			"isAllDay": "true"
		},
		{
			"title": "Spaces vs Tabs Rant Post Deadline",
			"startEpochMillis": "1483315200000",
			"isAllDay": "true"
		}
	];
	res.json(deadlines);
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
