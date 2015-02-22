var ChatClient = angular.module('ChatClient', ['ngRoute']);

ChatClient.config(
	function ($routeProvider) {
		$routeProvider
			.when('/login', { templateUrl: 'Views/login.html', controller: 'LoginController' })
			.when('/rooms/:user/', { templateUrl: 'Views/rooms.html', controller: 'RoomsController' })
			.when('/room/:user/:room/', { templateUrl: 'Views/room.html', controller: 'RoomController' })
			.otherwise({
	  			redirectTo: '/login'
			});
	}
);

ChatClient.controller('LoginController', function ($scope, $location, $rootScope, $routeParams, socket) {
	
	$scope.errorMessage = '';
	$scope.nickname = '';

	$scope.login = function() {			
		if ($scope.nickname === '') {
			$scope.errorMessage = 'Please choose a nick-name before continuing!';
		} else {
			socket.emit('adduser', $scope.nickname, function (available) {
				if (available) {
					$location.path('/rooms/' + $scope.nickname);
				} else {
					$scope.errorMessage = 'This nick-name is already taken!';
				}
			});			
		}
	};
});

ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {
	// TODO: Query chat server for active rooms
	$scope.rooms = ['Room 1','Room 2','Room 3','Room 4','Room 5'];
	$scope.currentUser = $routeParams.user;
});

ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	
	$scope.messages = [];

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		if($scope.currentRoom === roomName){
			$scope.currentUsers = users;
		}
	});		

	var joinObj = {
		room: $scope.currentRoom,
		pass: ''
	};
	socket.emit('joinroom', joinObj, function (success, reason) {
		if (!success)
		{
			$scope.errorMessage = reason;
		}
	});

	/* ********************************** ADDED ******************************* */
	$scope.sendMessage = function() {
		console.log($scope.message);
		var packet = {
			msg: $scope.message,
			roomName: $scope.currentRoom
		};
		socket.emit('sendmsg', packet, function(success, reason){
			if(!success)
			{
				$scope.errorMessage = reason;
			}
		});
		$('#message').val('');
	};

	socket.on('updatechat', function(roomName, history){
		$scope.messages = history;
		console.log('routeParams: ' + $routeParams.room);
		console.log('roomName from chatserver: ' + roomName);
		console.log('history from chatserver: ' + history);
	});

});

/*
ChatClient.directive('schrollBottom', function() {
	return {
		scope: {
			schrollBottom: '='
		},
		link: function(scope, element){
			scope.$watchCollection('schrollBottom', function(newValue){
				if(newValue){
					$(element).scrollTop($(element)[0].scrollHeight);
				}
			});
		}
	}
});
*/
