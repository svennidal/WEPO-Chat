// Function from Andri
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
