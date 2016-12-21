var config = function(app)
{
	app.get('/', function(req, res)
	{
		res.render("main");
	});

	app.get('/calendar', function(req, res)
	{
		res.render("calendar");
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
};

module.exports = { config : config };