angular.module('eventCtrl', ['eventService'])

.controller('eventController', function(Event) {

	var vm = this;
	
	// set a processing variable to show loading things
	vm.processing = true;
	vm.hasQueried = false;

	vm.message = "";
	vm.query = "";
	vm.showResults = "";

		// grab all the events at page load
	Event.all()
		.success(function(data) {
			
			// when all the users come back, remove the processing variable
			vm.processing = false;
			// bind the users that come back to vm.events
			vm.events = data;
		});

	vm.processing = false;

	//to search
	vm.search = function() {
		Event.search(vm.query).success(function(data) {
			vm.processing = true;
			vm.events = data;
			vm.processing = false;
		});

		vm.hasQueried = true;
		vm.showResults = vm.query;
		vm.query = "";
		
	};

})

.controller('eventCreateController', function(Event) {
	var vm = this;
	
	// variable to hide/show elements of the view
	// differentiates between create or edit pages
	vm.type = 'create';

	// function to create a user
	vm.saveEvent = function() {

		vm.processing = true;
		vm.message = '';

		// use the create function in the userService
		Event.create(vm.eventData)
			.success(function(data) {
				vm.processing = false;
				vm.eventData = {};
				vm.message = data.message;
			});
			
	};
})

.controller('eventViewController', function($routeParams, Event, Auth, $window) {
	
	var vm = this;
	//vm.message = "NOT TEST USER" //$routeParams.event_id;
	vm.tag = "sampleTag";
	
	vm.isOwner = false;

	vm.processing = true;

	//retrieve events
	Event.get($routeParams.event_id).success(function(data) {
		vm.eventData = data;
	});
	
	//retrieve participants
	Event.getParticipants($routeParams.event_id).success(function(data) {
		vm.participantData = data;
	});

	//retrieve tags
	Event.getTags($routeParams.event_id).success(function(data){
		vm.tagData = data;
	});

	//check if user is owner
	Auth.getUser().then(function(data) {
		if(data.data.username == 'test') vm.isOwner = true; //vm.isCurrentUser = true;
	});

	vm.processing = false;

	console.log(vm.eventData);
	
	vm.addParticipant = function() {
		
		//retrieve userDetails
		Auth.getUser()
			.then(function(data) {
				vm.username = data.data.username;
				//vm.message = $routeParams.event_id;
			});
			
		Event.addParticipant($routeParams.event_id);

		vm.message = "event joined!!";
	};

	vm.addTag = function() {

		var output = {"tag": vm.tag};

		Event.addTag($routeParams.event_id, output);
		vm.message = vm.tagData;

		$window.location.reload();

		console.log("reloading..");
	};
});



