angular.module('eventService', [])

.factory('Event', function($http) {

	// create a new object
	var eventFactory = {};

	// get a single user
	eventFactory.get = function(id) {
		return $http.get('/api/events/' + id);
	};

	// get all users
	eventFactory.all = function() {
		return $http.get('/api/events/');
	};

	// create a user
	eventFactory.create = function(eventData) {
		return $http.post('/api/events/', eventData);
	};

	// update a user
	eventFactory.update = function(id, eventData) {
		return $http.put('/api/events/' + id, eventData);
	};

	// delete a user
	eventFactory.delete = function(id) {
		return $http.delete('/api/events/' + id);
	};
	
	eventFactory.addParticipant = function(id) {
		return $http.post('/api/addpinevent/' + id);
	};
	
	eventFactory.getParticipants = function(id) {
		return $http.get('/api/retparticipants/' + id);
	};

	// TAG FUNCTIONS //
	eventFactory.addTag = function(id, tag) {
		return $http.post('/api/addtag/' + id, tag);
	};
	
	eventFactory.getTags = function(id) {
		return $http.get('/api/gettags/' + id); 
	};

	// SEARCH FUNCTIONS //
	eventFactory.search = function(tag) {
		return $http.get('/api/search/' + tag);
	};

	// return our entire eventFactory object
	return eventFactory;

});