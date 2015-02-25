// Function from Andri
contains = function(arr, obj){
	for (var user in arr) {
		if(user === obj){
			return true;
		}
	}
	return false;
};
