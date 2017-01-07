var mongodb = require('mongodb');

var getTaskJSONWithMongoObjectID = function(request)
{
	var taskJSON = request.body;
	taskJSON._id = new mongodb.ObjectId(taskJSON._id);
	return taskJSON;
};

var deadlineJSONWithoutIDToDeadlineJSON = function(deadlineJSONWithoutID)
{
	var deadlineJSON = deadlineJSONWithoutID;
	deadlineJSON._id = new mongodb.ObjectId();
	for (var i = 0; i < deadlineJSON.subTasks.length; i++)
	{
		deadlineJSON.subTasks[i].deadlineId = deadlineJSON._id;
		deadlineJSON.subTasks[i]._id = new mongodb.ObjectId();
	};
	return deadlineJSON;
}

// STUB (does not handle mongodb errors):

var config = function(app, db)
{
	app.get('/', function(request, response)
	{
		response.render("main");
	});

	// Response: TaskJSON[]
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
		db.collection("deadlines", function(collection_error, collection)
		{
			collection.find().toArray(function(array_error, documents)
			{
				console.log("Loaded deadlines:");
				console.log(documents);
				response.json(documents);
			});
		});
	});

	// Argument: TaskJSONWithoutID
	app.post('/add-task', function(request, response)
	{
		var taskObject = request.body;
		console.log("Task to add: ")
		console.log(taskObject);
		
		db.collection("tasks", function(collection_error, collection)
		{
			// insertion automatically adds _id field
			collection.insert(taskObject, {}, function(insert_error, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: DeadlineJSONWithoutID
	app.post('/add-deadline', function(request, response)
	{
		var deadlineObjWithoutId = request.body;
		console.log("Deadline to add: ")
		console.log(deadlineObjWithoutId);
		
		db.collection("deadlines", function(collection_error, collection)
		{
			var deadlineJSON = deadlineJSONWithoutIDToDeadlineJSON(deadlineObjWithoutId);
			collection.insert(deadlineJSON, {}, function(insert_error, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: TaskJSON
	app.post('/update-task', function(request, response)
	{
		var taskJSON = getTaskJSONWithMongoObjectID(request);
		console.log("Task to update: ")
		console.log(taskJSON);

		db.collection("tasks", function(collection_error, collection)
		{
			collection.findOneAndReplace({"_id": taskJSON._id}, taskJSON, {}, 
											function(replace_error, result)
			{
				response.json(result);
			});
		});
	});

	// Argument: TaskJSON
	app.post('/delete-task', function(request, response)
	{
		var taskJSON = getTaskJSONWithMongoObjectID(request);
		console.log("Task to delete: ")
		console.log(taskJSON);

		db.collection("tasks", function(collection_error, collection)
		{
			collection.remove({"_id": taskJSON._id}, {}, 
								function(remove_error, result)
			{
				response.json(result);
			});
		});
	});
};

module.exports = { config : config };