ChatClient.controller('RoomsController', function ($scope, $location, $rootScope, $routeParams, socket) {
	$scope.currentUser = $routeParams.user;
	$scope.rooms = [];
	$scope.banrooms = [];
	$scope.banstring = "";
	$scope.curruserisbanned = false;
	$scope.lockedRooms = [];



/*************************************** CREATE ROOM *************************/
	$scope.createRoom = function(){
		$scope.rooms.push($scope.newRoom);
		$('#newRoom').val('');
	};
/************************************* // CREATE ROOM *************************/
/*********************************************** REFRESH ROOM LIST ************/
	socket.emit('rooms');
	socket.on('roomlist', function(roomList){

		$scope.rooms = [];

		for (var room in roomList){
			if(contains(roomList[room].banned, $scope.currentUser)){
				$scope.CurrentUserIsBanned = true;
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
		var url = '/#/login';
		document.location = url;
	};
/*************************************** // LOGOUT ****************************/



}); /****** //  RoomsController **********************************************/
