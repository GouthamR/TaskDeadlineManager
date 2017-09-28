var mongodb = require('mongodb');

var convertIdToMongoObjectId = function(json)
{
	json._id = new mongodb.ObjectId(json._id);
	return json;
};

var addIDToJSON = function(jsonWithoutID)
{
	jsonWithoutID._id = new mongodb.ObjectID();
};

var addIDToDeadlineJSON = function(deadlineJSONWithoutID)
{
	addIDToJSON(deadlineJSONWithoutID);
	for (var i = 0; i < deadlineJSONWithoutID.subTasks.length; i++)
	{
		deadlineJSONWithoutID.subTasks[i].deadlineId = deadlineJSONWithoutID._id;
		addIDToJSON(deadlineJSONWithoutID.subTasks[i]);
	}
};

// STUB (does not handle mongodb errors):

var config = function(app, db)
{
	app.get('/', function(request, response)
	{
		response.render("main");
	});

	app.get('/user/name', function(request, response)
	{
		db.collection("users", function(collection_error, collection)
		{
			collection.findOne({}, {}, function(find_err, doc)
			{
				response.json(doc.name);
			});
		});
	});

	// Response: TaskJSON[]
	app.get('/load-tasks', function(request, response)
	{
		db.collection("users", function(collection_error, collection)
		{
			collection.findOne({}, {}, function(find_err, doc)
			{
				console.log("Loaded tasks:");
				console.log(doc.tasks);
				response.json(doc.tasks);
			});
		});
	});

	app.get('/load-deadlines', function(request, response)
	{
		db.collection("users", function(collection_error, collection)
		{
			collection.findOne({}, {}, function(find_err, doc)
			{
				console.log("Loaded deadlines:");
				console.log(doc.deadlines);
				response.json(doc.deadlines);
			});
		});
	});

	// Argument: TaskJSONWithoutID
	app.post('/add-task', function(request, response)
	{
		var taskObject = request.body;
		addIDToJSON(taskObject);
		console.log("Task to add: ")
		console.log(taskObject);

		db.collection("users", function(collection_error, collection)
		{
			collection.updateOne({}, {$push: {tasks: taskObject}}, {}, function(err, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: DeadlineJSONWithoutID
	app.post('/add-deadline', function(request, response)
	{
		var deadlineJSON = request.body;
		// since an empty array on the client side is passed in the request as undefined, reassign:
		if(deadlineJSON.subTasks == undefined)
		{
			deadlineJSON.subTasks = [];
		}
		
		addIDToDeadlineJSON(deadlineJSON);
		console.log("Deadline to add: ")
		console.log(deadlineJSON);
		
		db.collection("users", function(collection_error, collection)
		{
			collection.updateOne({}, {$push: {deadlines: deadlineJSON}}, {}, function(err, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: TaskJSON
	app.post('/update-task', function(request, response)
	{
		var taskJSON = convertIdToMongoObjectId(request.body);
		console.log("Task to update: ")
		console.log(taskJSON);

		db.collection("users", function(collection_error, collection)
		{
			collection.updateOne({"tasks._id": taskJSON._id}, {$set: {"tasks.$": taskJSON}}, {}, function(err, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: DeadlineJSON
	app.post('/update-deadline', function(request, response)
	{
		var deadlineJSON = convertIdToMongoObjectId(request.body);
		console.log("Deadline to update: ")
		console.log(deadlineJSON);

		db.collection("users", function(collection_error, collection)
		{
			collection.updateOne({"deadlines._id": deadlineJSON._id}, {$set: {"deadlines.$": deadlineJSON}}, {}, function(err, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: TaskJSON
	app.post('/delete-task', function(request, response)
	{
		var taskJSON = convertIdToMongoObjectId(request.body);
		console.log("Task to delete: ")
		console.log(taskJSON);

		db.collection("users", function(collection_error, collection)
		{
			collection.updateOne({}, {$pull: {tasks: {_id: taskJSON._id}}}, {}, function(err, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: DeadlineJSON
	app.post('/delete-deadline', function(request, response)
	{
		var deadlineJSON = convertIdToMongoObjectId(request.body);
		console.log("Deadline to delete: ")
		console.log(deadlineJSON);

		db.collection("users", function(collection_error, collection)
		{
			collection.updateOne({}, {$pull: {deadlines: {_id: deadlineJSON._id}}}, {}, function(err, result)
			{
				response.json(result);
			});
		});
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
};

module.exports = { config : config };