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
		$('#newRoom').val('');
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
