ChatClient.controller('RoomController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentRoom = $routeParams.room;
	$scope.currentUser = $routeParams.user;
	$scope.currentPassword = $routeParams.pass;
	$scope.currentUsers = [];
	$scope.currentOps = [];
	$scope.errorMessage = '';
	$scope.currentBanned = [];
	$scope.currentTopic = '';
	$scope.currentUserIsOp = false;
	$scope.sendpmto = "";
	$scope.currentPrivateMessage = "";
	$scope.currentServerMessageIs = false;
	$scope.currentServerMessage = '';
	$scope.messages = [];


/****************************************** UPDATE USERS **********************/
	socket.on('updateusers', function (roomName, users, ops) {
		// Making sure the messages go to a right room - SDB
		if($scope.currentRoom === roomName){
			$scope.currentUsers = users;
			$scope.currentOps = ops;
			$scope.currentUserIsOp = false;
			for(var op in ops){
				if(op === $scope.currentUser){
					$scope.currentUserIsOp = true;
				}
			}
		}
	});		
/*************************************** // UPDATE USERS **********************/



/************************ JOINING AND LEAVING ROOMS ***************************/
	// Joining a room
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
		var url = '/#/rooms/' + $scope.currentUser + '/';
		document.location = url;
		socket.emit('partroom', $scope.currentRoom, function(success, reason){
			if(!success){
				$scope.errorMessage = reason;
			}
		});
	};
/********************** // JOINING AND LEAVING ROOMS **************************/



/********************************* TOPIC **************************************/
	// Changing the topic
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

	// Update the topic
	socket.on('updatetopic', function(room, topic, user){
		if($scope.currentRoom === room){
			$scope.currentTopic = topic;
		}
	});
/********************************* // TOPIC ***********************************/



/********************************* PASSWORD ***********************************/
	// Set a password for a room
	$scope.setPassword = function(){
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

	// Unset a password for a room
	$scope.unSetPassword = function(){
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
	// Kick a user
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

	// Server response on kick
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
	// Banning a user
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

	// Server responding to banning a user
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
	// Unbanning a user
	$scope.unBanUser = function(unBannedUser){
		var index = $scope.currentBanned.indexOf(unBannedUser);
		if(index > -1){ $scope.currentBanned.splice(index, 1); }
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
	// Op a user
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

	// Server response to opping a user
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
	// Deopping a user
	$scope.deOpOp = function(deOppedOp){
		var success = true;
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

	// Server response to deopping a user
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
	// Send a message
	$scope.sendMessage = function() {
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

	// Server responds by updating the messagelist
	socket.on('updatechat', function(roomName, history){
		$scope.messages = history;
		//$scope.messages.reverse();
	});
/******************************************* SEND MESSAGE *********************/



/******************************************* SEND PRIVATE MESSAGE *************/
	// Sending a private message
	$scope.sendPMessage = function() {
		if($scope.sendpmto === ""){
			return;
		}
		var PMpacket = {
			message: $scope.message,
			nick: $scope.sendpmto
		};
		socket.emit('privatemsg', PMpacket, function(success, reason){
			if(!success) {
					$scope.errorMessage = reason;
				}
			// clearing the textbox
			$('#message').val('');
		});
	};

	// Recieving a private message
	socket.on('recv_privatemsg', function(username_, message_){
		$scope.currentPrivateMessage = (username_ + " says " + message_);
	});
/*************************************** // SEND PRIVATE MESSAGE ***************/



/****************************************** LOGOUT ****************************/
	// Logging out
	$scope.disconnect = function(){
		socket.emit('disconnected');
		var url = '/#/login';
		document.location = url;
	};
/*************************************** // LOGOUT ****************************/



/************************************** SERVERMESSAGE *************************/
	// Messages from the server
	socket.on('servermessage', function(action, room, user){
		if($scope.currentRoom === room || contains(room, $scope.currentRoom)){
			var msg = '';
			if(action === 'join'){
				msg = user + ' has joined ' + room;
			} else if(action === 'part'){
				msg = user + ' has parted ' + room;
			} else if(action === 'quit'){
				room = $scope.currentRoom;
				msg = user + ' has quit';
			}

			// Servermessages get temporarily added to the room message history
			// The disapear on the next normal message, since readnig followin a 
			// conversation would become troublesome if a lot of users were joining,
			// parting or disconnecting.
			var messageObj = {
				nick: room,
				timestamp: new Date(),
				message: msg
			};
			$scope.messages.push(messageObj);
		}
	});
/********************************** //  SERVERMESSAGE *************************/

}); /******************************* // RoomController ************************/
