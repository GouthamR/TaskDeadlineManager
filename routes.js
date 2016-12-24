var config = function(app, db)
{
	app.get('/', function(request, response)
	{
		response.render("main");
	});

	app.get('/calendar', function(request, response)
	{
		response.render("calendar");
	});

	app.get('/load-tasks', function(request, response)
	{
		db.collection("tasks", function(collection_error, collection)
		{
			collection.find().toArray(function(array_error, documents)
			{
				console.log("Loaded tasks:");
				console.log(documents);
				response.json(documents);
			});
		});
	});

	app.get('/load-deadlines', function(request, response)
	{
		var deadlines = require("./deadlines.json");
		response.json(deadlines);
	});

	app.post('/add-task', function(request, response)
	{
		// STUB:
		var taskObject = request.body;
		console.log("Task to add: ")
		console.log(taskObject);
		response.redirect(303, '/');
	});
};

module.exports = { config : config };