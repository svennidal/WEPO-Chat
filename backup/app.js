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
		console.log('login');
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
	$scope.banrooms = [];
	$scope.banstring = "";
	$scope.curruserisbanned = false;
	$scope.lockedRooms = [];


/*************************************** CREATE ROOM *************************/
	// Creating a room - SDB
	$scope.createRoom = function(){
		console.log('createRoom: ' + $scope.newRoom);
		$scope.rooms.push($scope.newRoom);
	};
/************************************* // CREATE ROOM *************************/
/*********************************************** REFRESH ROOM LIST ************/
	// Getting a list of all active rooms - SDB
	socket.emit('rooms');
	socket.on('roomlist', function(roomList){
		console.log(roomList);

		$scope.rooms = [];

		for (var room in roomList){
			if(contains(roomList[room].banned, $scope.currentUser)){
				$scope.CurrentUserIsBanned = true;
				console.log("bannadur i " + room);
				$scope.banstring = "banned from";
				$scope.banrooms.push(room);
			} else if(roomList[room].password){
				$scope.lockedRooms.push(room);
			} else {
				$scope.rooms.push(room);
			}
		}
	});
/********************************************* // REFRESH ROOM LIST ************/



/****************************************** LOGOUT ****************************/
	$scope.disconnect = function(){
		socket.emit('disconnected');
		console.log('disconnection: ' + document.location);
		var url = '/#/login';
		document.location = url;
	};
/*************************************** // LOGOUT ****************************/

});




ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentPassword = $routeParams.pass;
	$scope.currentUsers = [];
	$scope.currentOps = [];
	$scope.currentInsideroom = [];
	$scope.errorMessage = '';
	$scope.currentBanned = [];
	$scope.currentTopic = '';
	$scope.currentUserIsOp = false;
	$scope.sendpmto = "";

	
	$scope.messages = [];

	socket.on('updateusers', function (roomName, users, ops) {
		// TODO: Check if the roomName equals the current room !
		// Making sure the messages go to a right room - SDB
		if($scope.currentRoom === roomName){
			$scope.currentUsers = users;
			$scope.currentOps = ops;
			$scope.currentInsideroom = unite($scope.currentUsers, $scope.currentOps);
			console.log("currinside" + $scope.currentInsideroom);
			console.log("currops" + $scope.currentOps);
			$scope.currentUserIsOp = false;
			for(var op in ops){
				if(op === $scope.currentUser){
					$scope.currentUserIsOp = true;
				}
			}
		}
	});		


	/********************** JOINING AND LEAVING ROOMS ***************************/
	// Creating a object for the serverside joinroom operation
	// Password property needs to be changed in order to allow for a password.
	// SDB
	console.log($scope.currentPassword);
	var joinObj = {
		room: $scope.currentRoom,
		pass: $scope.currentPassword
	};
	socket.emit('joinroom', joinObj, function (success, reason) {
		if (!success)
		{
			$scope.errorMessage = reason;
			var url = '/#/rooms/' + $scope.currentUser + '/';
			document.location = url;
			$scope.errorMessage = reason;
		}
	});

	// Leaving room
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
	/******************** // JOINING AND LEAVING ROOMS **************************/



	/******************************* TOPIC **************************************/
	$scope.setTopic = function(){
		var topicPacket = {
			room: $scope.currentRoom,
			topic: $scope.topic
		};
		var success = true;
		socket.emit('settopic', topicPacket, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
		success = true;
		var topicMessage = '*** topic:"' + $scope.topic + '" was set by me. ***';
		var packet = {
			msg: topicMessage,
			roomName: $scope.currentRoom
		};
		socket.emit('sendmsg', packet, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
		$('#topicInput').val('');
	};
	socket.on('updatetopic', function(room, topic, user){
		if($scope.currentRoom === room){
			$scope.currentTopic = topic;
		}
	});
	/******************************* // TOPIC ***********************************/



	/******************************* PASSWORD ***********************************/
	$scope.setPassword = function(){
		console.log('Password being set: ' + $scope.password);
		var passwordPacket = {
			room: $scope.currentRoom,
			password: $scope.password
		};
		var success = true;
		socket.emit('setpassword', passwordPacket, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};

	$scope.unSetPassword = function(){
		console.log('Password being unset');
		var unSetPasswordPacket = {
			room: $scope.currentRoom,
		};
		var success = true;
		socket.emit('removepassword', unSetPasswordPacket, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
		$('#passwordInput').val('');
	};

	/******************************* // PASSWORD ********************************/



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
		$scope.currentBanned.push(bannedUser);
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
/********************************************** UNBAN *************************/
	// The angular-function UnBanUser(unBannedUser)
	$scope.unBanUser = function(unBannedUser){
		var index = $scope.currentBanned.indexOf(unBannedUser);
		if(index > -1){ $scope.currentBanned.splice(index, 1); }
		console.log($scope.currentBanned + ' is no ' + index);
		var success = true;
		var unBanPacket = {
			room: $scope.currentRoom,
			user: unBannedUser
		};
		socket.emit('unban', unBanPacket, function(succes, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};
/********************************************** // UNBAN **********************/



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
/********************************************** // DEOP ***********************/



/******************************************* SEND MESSAGE *********************/
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
	});
/**************************************** // SEND MESSAGE *********************/

/******************************************* SEND PRIVATE MESSAGE *************/

$scope.sendPMessage = function() {
	if($scope.sendpmto === "")
		return;
	var PMpacket = {
		message: $scope.message,
		nick: $scope.sendpmto
	};
	socket.emit('privatemsg', PMpacket, function(success, reason){
		if(!success)
			{
				$scope.errorMessage = reason;
			}
		// clearing the textbox
		$('#message').val('');
	});
	console.log($scope.message);
	console.log($scope.sendpmto);
}
	socket.on('recv_privatemsg', function(username_, message_){
		console.log(message_ + " from " + username_);
	});
/*************************************** // SEND PRIVATE MESSAGE ***************/


/****************************************** LOGOUT ****************************/
	$scope.disconnect = function(){
		var success = true;
		socket.emit('partroom', $scope.currentRoom, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
		socket.emit('disconnected');
		console.log('disconnection: ' + document.location);
		var url = '/#/login';
		document.location = url;
	};
/*************************************** // LOGOUT ****************************/


}); // room-Controller



unite = function(arr1, arr2)
{
	arr3 = [];
	for(var item in arr1)
		arr3.push(arr1[item]);
	for(var item in arr2)
		arr3.push(arr2[item]);
	return arr3;
}

contains = function(arr, obj){
	//console.log("contains keyrt med " + obj);
	for (var user in arr) {
		{
			//console.log("bera saman " + user + " og " + obj);
			if(user === obj)
			return true;
		}
	}
	return false;
};