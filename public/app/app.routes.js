angular.module('app.routes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

		// route for the home page
		.when('/', {
			templateUrl : 'app/views/pages/home.html'
		})
		
		// login page
		.when('/login', {
			templateUrl : 'app/views/pages/login.html',
   			controller  : 'mainController',
    		controllerAs: 'login'
		})

		.when('/signup', {
			templateUrl : 'app/views/pages/signup.html',
			controller  : 'mainController',
			controllerAs: 'signup'
		})
		
		// show all users
		.when('/users', {
			templateUrl: 'app/views/pages/users/all.html',
			controller: 'userController',
			controllerAs: 'user'
		})

		// form to create a new user
		// same view as edit page
		.when('/users/create', {
			templateUrl: 'app/views/pages/users/single.html',
			controller: 'userCreateController',
			controllerAs: 'user'
		})

		// page to edit a user
		.when('/users/:user_id', {
			templateUrl: 'app/views/pages/users/single.html',
			controller: 'userEditController',
			controllerAs: 'user'
		})
		
		// show all events
		.when('/events', {
			templateUrl: 'app/views/pages/events/all.html',
			controller: 'eventController',
			controllerAs: 'event'
		})
		
		// page to create an event
		.when('/events/create', {
			templateUrl: 'app/views/pages/events/single.html',
			controller: 'eventCreateController',
			controllerAs: 'event'
		})
		
		// event page
		.when('/events/:event_id', {
			templateUrl: 'app/views/pages/events/event.html',
			controller: 'eventViewController',
			controllerAs: 'event',
			resolve: {
			}
		})
		
		//participants page
		.when('/events/:event_id/:participants', {
			templateUrl: 'app/views/pages/events/participants.html',
			controller: 'eventViewController',
			controllerAs: 'event',
			resolve: {
			}
		});
		
		$locationProvider.html5Mode(true);

});
