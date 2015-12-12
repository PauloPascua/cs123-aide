var bodyParser = require('body-parser'); 	// get body-parser
var User       = require('../models/user');
var Event	   = require('../models/event');
var Participant = require('../models/participant');
var Tag		   = require('../models/tag')
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
var q          = require('q');

// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// route to signup (hopefully no token interceptor)
	apiRouter.post('/signup', function(req, res) {
		var newUser = new User();
		newUser.name = req.body.name;
		newUser.username = req.body.username;
		newUser.password = req.body.password;

		newUser.save(function(err) {
			if (err) {
				// username is in use
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with that username already exists. '});
				else
					return res.send(err);
			}

			// return a message
			console.log(newUser);
			res.json({ message: 'Successfully signed up!' });
		});
	});

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRouter.post('/authenticate', function(req, res) {

	  // find the user
	  User.findOne({
	    username: req.body.username
	  }).select('name username password').exec(function(err, user) {

	    if (err) throw err;

	    // no user with that username was found
	    if (!user) {
	      res.json({ 
	      	success: false, 
	      	message: 'Authentication failed. User not found.' 
	    	});
	    } else if (user) {

	      // check if password matches
	      var validPassword = user.comparePassword(req.body.password);
	      if (!validPassword) {
	        res.json({ 
	        	success: false, 
	        	message: 'Authentication failed. Wrong password.' 
	      	});
	      } else {

	        // if user is found and password is right
	        // create a token
	        var token = jwt.sign({
	        	name: user.name,
	        	username: user.username
	        }, superSecret, {
	          expiresInMinutes: 1440 // expires in 24 hours
	        });

	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'Enjoy your token!',
	          token: token
	        });
	      }   

	    }

	  });
	});

	// route middleware to verify a token
	apiRouter.use(function(req, res, next) {
		// do logging
		console.log('Somebody just came to our app!');

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, superSecret, function(err, decoded) {      

	      if (err) {
	        res.status(403).send({ 
	        	success: false, 
	        	message: 'Failed to authenticate token.' 
	    	});  	   
	      } else { 
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;
			
	        next(); // make sure we go to the next routes and don't stop here
	      }
	    });

	  } else {

	    // if there is no token
	    // return an HTTP response of 403 (access forbidden) and an error message
   	 	res.status(403).send({ 
   	 		success: false, 
   	 		message: 'No token provided.' 
   	 	});
	    
	  }
	});

	// test route to make sure everything is working 
	// accessed at GET http://localhost:8080/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});

	//-----------------------------------------------------
	// ROUTES THAT END WITH /USERS
	// ----------------------------------------------------

	apiRouter.route('/users')

		// create a user (accessed at POST http://localhost:8080/users)
		.post(function(req, res) {
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
			
			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});

		})

		// get all the users (accessed at GET http://localhost:8080/api/users)
		.get(function(req, res) {

			User.find({}, function(err, users) {
				if (err) res.send(err);

				// return the users
				res.json(users);
			});
		});

	// ----------------------------------------------------
	// ROUTES THAT END IN /USERS/:USER_ID
	// ----------------------------------------------------

	apiRouter.route('/users/:user_id')

		// get the user with that id
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);

				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {

				if (err) res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;

				// save the user
				user.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'User updated!' });
				});

			});
		})

		// delete the user with this id
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});
	
	// ----------------------------------------------------
	// ROUTES THAT END IN /EVENTS
	// ----------------------------------------------------

	apiRouter.route('/events')
		
		// get all events (accessed at GET http://localhost:8080/events )
		.get(function(req, res) {
			
			console.log("events being retrieved...");
			Event.find({}, function(err, events) {
				if (err) res.send(err);

				// return the events
				res.json(events);
			});
		})
		
		// create an event (accessed at POST http://localhost:8080/events)
		.post(function(req, res) {
			
			//add the event//

			var e = new Event();		// create a new instance of the User model
			e.name = req.body.name;
			e.description = req.body.description;
			e.owner = req.decoded.username;
			
			e.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}
				// return a message
				res.json({ message: 'Event Created!' });
			});
		});
		
		// ----------------------------------------------------
		// PARTICIPANT ROUTES
		// ----------------------------------------------------

		apiRouter.route('/addpinevent/:event_id').post(function(req,res) {
	
			var participant = new Participant();
			
			console.log("inside the asdfasdfasdf!");
			
			participant.username = req.decoded.username;
			participant.event_id = req.params.event_id;
			
			participant.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'Participant created!' });
			});
			
			console.log("finished saving!!!");
		});
		
		//retrieve participants
		apiRouter.route('/retparticipants/:event_id').get(function(req,res) {
		
			console.log("participants being retrieved...");
			
			Participant.find({event_id: req.params.event_id}, function(err, participants) {
				if (err) res.send(err);

				// return the events
				res.json(participants);
			});
		});
		
		// ----------------------------------------------------
		// ROUTES THAT END WITH /EVENTS/:EVENT_I
		// ----------------------------------------------------

		apiRouter.route('/events/:event_id')
		
		// get the user with that id
		.get(function(req, res) {
			Event.findById(req.params.event_id, function(err, ev) {
				if (err) res.send(err);
				// return that event
				res.json(ev);
			});
		});

		// ----------------------------------------------------
		// TAG ROUTES
		// ----------------------------------------------------

		apiRouter.route('/addtag/:event_id').post(function(req,res) {
			
			console.log("someone added a tag!");
			var tag = new Tag();

			console.log(req.body.tag);
			
			tag.tag = req.body.tag;
			tag.event_id = req.params.event_id;
			
			tag.save(function(err) {
				if (err) {
		// 			// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else {
						console.log(err);
						return res.send(err);
					}
				}
				// return a message
				res.json({ message: 'TAG created!' });
			});
			
			console.log("finished saving!!!");
		});

		//retrieve tags
		apiRouter.route('/gettags/:event_id').get(function(req,res) {
		
			console.log("tags being retrieved...");
			
			Tag.find({event_id: req.params.event_id}, function(err, tags) {
				if (err) res.send(err);

				// return the events
				res.json(tags);
				console.log("tags found!");
			});
		});

		// ----------------------------------------------------
		// SEARCH FUNCTION
		// ----------------------------------------------------

		apiRouter.route('/search/:tag').get(function(req,res){
			console.log("search was called!");
			console.log(req.params.tag);

			//finds events given a tag
			var findTag = function() {

				var deferred = q.defer();
				
				//var tempQuery = "{ tag: /^" + req.params.tag +"$/i }";
				//console.log(tempQuery);

				Tag.find({tag: req.params.tag}, function(err, ev) {
					if(err) res.send(err);

					for(var i in ev) {
						event_ids.push(ev[i].event_id);
					}

					// console.log("events found: " + eventArray.toString() );
					deferred.resolve();
				});

				return deferred.promise;
			};

			var fe = function() {

				var deferred = q.defer();

				Event.findById(event_ids[index], function(err,ev) {
					if(err) res.send(err);

					console.log("pushing " + ev);
					eventArray.push(ev);

					//increment index
					index++;

					deferred.resolve();
				});

				// deferred.resolve();
				return deferred.promise;

			}

			// responsible for looping pushEvent until it resolves
			var findEvents = function() {

				//console.log("in findevents; event_ids is " + event_ids);
				var deferred = q.defer();

				var currentIndex = index;

				console.log("current index is " + currentIndex);

				if(currentIndex >= event_ids.length){
					deferred.resolve(false);
				}
				else {
					deferred.resolve(true);
				}

				return deferred.promise;
			};

			// retrieves event id from event_ids[index] and pushes it into eventArray
			// itterates until cont is true
			var pushEvent = function(cont) {

				var deferred = q.defer();

				if(cont) {
					//findByID at current index
					fe().then(findEvents).then(pushEvent).then(function(){
							deferred.resolve();
					});

				}
				else {
					//stop
					deferred.resolve();
				}

				return deferred.promise;
			};

			var event_ids = [];
			var eventArray = [];
			var index = 0;

			findTag().then(findEvents).then(pushEvent).then(function(){
				res.json(eventArray);
			});
		});

	return apiRouter;

};