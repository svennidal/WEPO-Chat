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
	$scope.currentOps = [];
	$scope.errorMessage = '';
	
	$scope.messages = [];

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		// Making sure the messages go to a right room - SDB
		if($scope.currentRoom === roomName){
			$scope.currentUsers = users;
			$scope.currentOps = ops;
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



/********************************************** KICK *************************/
	// The angular-function kickUser(user)
	$scope.kickUser = function(kickedUser){
		var success = true;
		var kickPacket = {
			room: $scope.currentRoom,
			user: kickedUser
		};
		socket.emit('kick', kickPacket, function(success, reason) {
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};

	// When a user is kicked the server emits 'kicked'
	socket.on('kicked', function(room, kickedUser, op){
		if($scope.currentUser === kickedUser && $scope.currentRoom === room){
			$scope.leaveRoom();
		}
		if($scope.currentUser === op && $scope.currentRoom === room){
			var success = true;
			var kickMessage = '*** ' + kickedUser + ' was kicked by me. ***';
			var packet = {
				msg: kickMessage,
				roomName: $scope.currentRoom
			};
			socket.emit('sendmsg', packet, function(success, reason){
				if(!success){
					$scope.errorMessage = reason;
				}
			});
		}
	});
/******************************************** // KICK *************************/



/*********************************************** BAN **************************/
	$scope.banUser = function(bannedUser){
		var success = true;
		var BanPacket = {
			room: $scope.currentRoom,
			user: bannedUser
		};
		socket.emit('ban', BanPacket, function(success, reason) {
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};
	socket.on('banned', function(room, bannedUser, op){
		if($scope.currentUser === bannedUser && $scope.currentRoom === room){
			$scope.leaveRoom();
		}
		if($scope.currentUser === op && $scope.currentRoom === room){
			var success = true;
			var bannedMessage = '*** ' + bannedUser + ' was banned by me. ***';
			var packet = {
				msg: bannedMessage,
				roomName: $scope.currentRoom
			};
			socket.emit('sendmsg', packet, function(success, reason){
				if(!success){
					$scope.errorMessage = reason;
				}
			});
		}
	});
/********************************************* // BAN *************************/


/************************************************* OP *************************/
	// The angular-function Op(user)
	$scope.opUser = function(oppedUser){
		var success = true;
		var opPacket = {
			room: $scope.currentRoom,
			user: oppedUser
		};
		socket.emit('op', opPacket, function(succes, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};
	socket.on('opped', function(room, oppedUser, op){
		var success = true;
		if($scope.currentUser === op && $scope.currentRoom === room){
			var opMessage = '*** ' + oppedUser + ' was opped by me. ***';
			var packet = {
				msg: opMessage,
				roomName: $scope.currentRoom
			};
			socket.emit('sendmsg', packet, function(success, reason){
				if(!success){
					$scope.errorMessage = reason;
				}
			});
		}
	});
/********************************************** // OP *************************/

/************************************************* DEOP *************************/
	// The angular-function DeOp(user)
	$scope.deOpOp = function(deOppedOp){
		var success = true;
		console.log('deop');
		var deOpPacket = {
			room: $scope.currentRoom,
			user: deOppedOp
		};
		socket.emit('deop', deOpPacket, function(succes, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};
	socket.on('deopped', function(room, deOppedUser, op){
		var success = true;
		if($scope.currentUser === op && $scope.currentRoom === room){
			var deOpMessage = '*** ' + deOppedUser + ' was deopped by me. ***';
			var packet = {
				msg: deOpMessage,
				roomName: $scope.currentRoom
			};
			socket.emit('sendmsg', packet, function(success, reason){
				if(!success){
					$scope.errorMessage = reason;
				}
			});
		}
	});
/********************************************** // DEOP *************************/

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

