var mongodb = require('mongodb');
var request = require('request');
var querystring = require('querystring');
var crypto = require('crypto');
var expressHandlebars = require('express-handlebars');
var jwt = require('jsonwebtoken');

// enum:
let LoginType = {
	Google: 2
}

var getSynchronizerToken = function(reqSession) {
	if(!reqSession.synchronizerToken)
		reqSession.synchronizerToken = crypto.randomBytes(256).toString('hex');

	return reqSession.synchronizerToken;
};

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

var config = function(app, db, oauthConfig)
{
	// Note: OAuth was implemented manually (i.e. without using libraries) for learning purposes.
	app.get('/google-oauth-redirect', function(req, res)
	{
		if(req.query.state != getSynchronizerToken(req.session))
		{
			res.send('Aborting login: incorrect synchronizer token.');
		}
		else if(req.query.error)
		{
			res.send('Login error.');
		}
		else
		{
			let queryString = querystring.stringify(
			{
				"client_id": oauthConfig.google.clientId,
				"client_secret": oauthConfig.google.clientSecret,
				"code": req.query.code,
				"redirect_uri": oauthConfig.google.redirectUri,
				"grant_type": "authorization_code"
			});
			let postReqOptions =
			{
				url: `${oauthConfig.google.tokenUri}?${queryString}`,
				headers:
				{
					'Accept': 'application/json'
				}
			};
			request.post(postReqOptions, function(postErr, postRes, postBody)
			{
				if(postErr)
				{
					res.send('Error: OAuth POST failed, aborting login.');
				}
				else
				{
					let postBodyObj = JSON.parse(postBody);
					req.session.accessToken = postBodyObj.access_token;
					req.session.loginType = LoginType.Google;
					let decodedJWT = jwt.decode(postBodyObj.id_token);
					req.session.loginId = decodedJWT.sub;
					let name = decodedJWT.name;

					db.collection("users", function(collection_error, collection)
					{
						if(collection_error)
						{
							console.log(collection_error);
							res.json({error: "Failed to access database"});
						}
						else
						{
							collection.findOne({loginType: req.session.loginType, loginId: req.session.loginId}, {},
											function(find_err, doc)
							{
								if(find_err)
								{
									console.log(find_err);
									res.json({error: "Failed to access database"});
								}
								else if(!doc)
								{
									let newDoc = 
									{
										loginId: req.session.loginId,
										loginType: req.session.loginType,
										name: name,
										tasks: [],
										deadlines: []
									};
									collection.insertOne(newDoc, {}, function(insert_err, insert_result)
									{
										if(insert_err)
										{
											console.log("Failed to insert user:");
											console.log(insert_err);
											res.json({error: "Failed to add new user"});
										}
									});
								}
							});
						}
					});

					res.redirect('/');
				}
			});
		}
	});

	app.post('/logout', function(req, res)
	{
		if(!req.session.accessToken)
		{
			res.status(401).json({error: "Not logged in"});
		}
		else if(req.session.loginType == LoginType.Google)
		{
			let queryString = querystring.stringify(
			{
				token: req.session.accessToken
			});
			let getReqOptions =
			{
				url: `${oauthConfig.google.revokeUri}?${queryString}`,
				headers:
				{
					'Content-type': 'application/x-www-form-urlencoded'
				}
			};
			request.get(getReqOptions, function(getErr, getRes, getBody)
			{
				if(getErr || getRes.statusCode != 200)
				{
					console.log(getErr);
					console.log(getRes);
					res.json({error: "Failed to revoke token"});
				}
				else
				{
					req.session.destroy(function(err)
					{
						if(err)
							res.json({error: "Failed to end session."});
						else
							res.json({success: "Logged out"});
					});
				}
			});
		}
	});

	app.get('/oauth-client-config', function(req, res)
	{
		res.json(
		{
			google:
			{
				clientId: oauthConfig.google.clientId,
				authUri: oauthConfig.google.authUri,
				redirectUri: oauthConfig.google.redirectUri
			}
		});
	});

	var checkLoggedIn = function(req, res, next)
	{
		if(!req.session.accessToken)
			res.status(401).json({error: "Not logged in"});
		else
			next();
	};

	app.get('/user/name', checkLoggedIn, function(req, res)
	{
		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.findOne({loginType: req.session.loginType, loginId: req.session.loginId}, {},
									function(find_err, doc)
				{
					if(find_err)
					{
						console.log(find_err);
						res.json({error: "Failed to access database"});
					}
					else
					{
						res.json(doc.name);
					}
				});
			}
		});
	});

	// Response: TaskJSON[]
	app.get('/load-tasks', checkLoggedIn, function(req, res)
	{
		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.findOne({loginType: req.session.loginType, loginId: req.session.loginId}, {},
									function(find_err, doc)
				{
					if(find_err)
					{
						console.log(find_err);
						res.json({error: "Failed to access database"});
					}
					else
					{
						res.json(doc.tasks);
					}
				});
			}
		});
	});

	app.get('/load-deadlines', checkLoggedIn, function(req, res)
	{
		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.findOne({loginType: req.session.loginType, loginId: req.session.loginId}, {},
									function(find_err, doc)
				{
					if(find_err)
					{
						console.log(find_err);
						res.json({error: "Failed to access database"});
					}
					else
					{
						res.json(doc.deadlines);
					}
				});
			}
		});
	});

	// Argument: TaskJSONWithoutID
	app.post('/add-task', checkLoggedIn, function(req, res)
	{
		var taskObject = req.body;
		addIDToJSON(taskObject);

		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.updateOne({loginType: req.session.loginType, loginId: req.session.loginId},
										{$push: {tasks: taskObject}}, {},
										function(err, result)
				{
					if(err)
					{
						console.log(err);
						res.json({error: "Failed to update database"});
					}
					else
					{
						res.json(result);
					}
				});
			}
		});
	});

	// Argument: DeadlineJSONWithoutID
	app.post('/add-deadline', checkLoggedIn, function(req, res)
	{
		var deadlineJSON = req.body;
		// since an empty array on the client side is passed in the request as undefined, reassign:
		if(deadlineJSON.subTasks == undefined)
		{
			deadlineJSON.subTasks = [];
		}
		
		addIDToDeadlineJSON(deadlineJSON);
		
		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.updateOne({loginType: req.session.loginType, loginId: req.session.loginId},
										{$push: {deadlines: deadlineJSON}}, {},
										function(err, result)
				{
					if(err)
					{
						console.log(err);
						res.json({error: "Failed to update database"});
					}
					else
					{
						res.json(result);
					}
				});
			}
		});
	});

	// Argument: TaskJSON
	app.post('/update-task', checkLoggedIn, function(req, res)
	{
		var taskJSON = convertIdToMongoObjectId(req.body);

		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.updateOne({loginType: req.session.loginType, loginId: req.session.loginId, "tasks._id": taskJSON._id},
										{$set: {"tasks.$": taskJSON}}, {},
										function(err, result)
				{
					if(err)
					{
						console.log(err);
						res.json({error: "Failed to update database"});
					}
					else
					{
						res.json(result);
					}
				});
			}
		});
	});

	// Argument: DeadlineJSON
	app.post('/update-deadline', checkLoggedIn, function(req, res)
	{
		var deadlineJSON = convertIdToMongoObjectId(req.body);

		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.updateOne({loginType: req.session.loginType, loginId: req.session.loginId, "deadlines._id": deadlineJSON._id},
										{$set: {"deadlines.$": deadlineJSON}}, {},
										function(err, result)
				{
					if(err)
					{
						console.log(err);
						res.json({error: "Failed to update database"});
					}
					else
					{
						res.json(result);
					}
				});
			}
		});
	});

	// Argument: TaskJSON
	app.post('/delete-task', checkLoggedIn, function(req, res)
	{
		var taskJSON = convertIdToMongoObjectId(req.body);

		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.updateOne({loginType: req.session.loginType, loginId: req.session.loginId},
										{$pull: {tasks: {_id: taskJSON._id}}}, {},
										function(err, result)
				{
					if(err)
					{
						console.log(err);
						res.json({error: "Failed to update database"});
					}
					else
					{
						res.json(result);
					}
				});
			}
		});
	});

	// Argument: DeadlineJSON
	app.post('/delete-deadline', checkLoggedIn, function(req, res)
	{
		var deadlineJSON = convertIdToMongoObjectId(req.body);

		db.collection("users", function(collection_error, collection)
		{
			if(collection_error)
			{
				console.log(collection_error);
				res.json({error: "Failed to access database"});
			}
			else
			{
				collection.updateOne({loginType: req.session.loginType, loginId: req.session.loginId},
										{$pull: {deadlines: {_id: deadlineJSON._id}}}, {},
										function(err, result)
				{
					if(err)
					{
						console.log(err);
						res.json({error: "Failed to update database"});
					}
					else
					{
						res.json(result);
					}
				});
			}
		});
	});

	app.get("/", function(req, res)
	{
		if(req.session.accessToken)
			res.render('main');
		else
			res.render("landing", {synchronizerToken: getSynchronizerToken(req.session)});
	});

	app.get('/*', function(req, res)
	{
		if(req.session.accessToken)
			res.render('main');
		else
			res.redirect("/"); // to render landing with "/" url (instead of the given url, e.g. "/calendar")
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