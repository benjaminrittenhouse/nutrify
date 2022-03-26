function dt(){
	var today = new Date();
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();
	today = mm + '/' + yyyy;

	console.log("hello");

	return today;
}