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
	$scope.currentUser = $routeParams.user;
	$scope.rooms = [];

	// Creating a room - SDB
	$scope.createRoom = function(){
		console.log('createRoom: ' + $scope.newRoom);
		$scope.rooms.push($scope.newRoom);
	};

	// Getting a list of all active rooms - SDB
	socket.emit('rooms');
	socket.on('roomlist', function(roomList){
		console.log(roomList);

		for(var room in roomList){
			$scope.rooms.push(room);
		}
	});

});

ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentUsers = [];
	$scope.errorMessage = '';
	
	$scope.messages = [];

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		// Making sure the messages go to a right room - SDB
		if($scope.currentRoom === roomName){
			$scope.currentUsers = users;
		}
	});		

	// Creating a object for the serverside joinroom operation
	// Password property needs to be changed in order to allow for a password.
	// SDB
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

	$scope.leaveRoom = function(){
		console.log('LeaveRoom: ' + document.location);
		var url = '/#/rooms/' + $scope.currentUser + '/';
		document.location = url;
		socket.emit('partroom', $scope.currentRoom, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};


	// The angular-function sendMessage()
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
		// clearing the textbox
		$('#message').val('');
	};

	// Updating the chat history according to the current room. - SDB
	socket.on('updatechat', function(roomName, history){
		$scope.messages = history;
		/*
		console.log('routeParams: ' + $routeParams.room);
		console.log('roomName from chatserver: ' + roomName);
		console.log('history from chatserver: ' + history);
		*/
	});

});

