var popup = d3.select(".g-popup-box");

d3.select(".g-popup-box-x").on("click", function(){
	popup.classed("g-active", false);
})

if (!localStorage.iswimloggedin) {
	localStorage.iswimloggedin = false	
}

if (localStorage.iswimloggedin == "true") {
	d3.select(".g-login").attr("data-state", "loggedin")
	d3.select(".g-login-inner").text("Hi, Sun Lai")

} else {

}	

d3.select(".g-login").on("click", function(){
	console.log("hi")
	if (localStorage.iswimloggedin == "false") {
		location.href = 'login.html';
	} else {
		location.href = 'client.html';
	}

})

d3.selectAll(".g-button").on("click", function(){

	var el = d3.select(this);
	var action = el.attr("data-id");

	console.log(localStorage.iswimloggedin)

	if (action == "login") {

		console.log("login")

		var u = d3.select("input#name").property("value")
		var p = d3.select("input#pw").property("value")

		if (u == "sunlai" && p == "12345678") {
			localStorage.iswimloggedin = true;
			location.href = 'document.html';
		} else {
			d3.select(".g-bad-login").style("opacity", 0).transition().duration(100).style("opacity", 1)
		}

	} else if (action == "logout") {

		localStorage.iswimloggedin = false;
		location.href = "index.html"

	} else if (localStorage.iswimloggedin == "false") {
		console.log("hi")
		location.href = "login.html"

	} else {

		// if (action == "request") {
			popup.classed("g-active", true);
			var popupinner = d3.select(".g-popup-inner-cont").html("");
			console.log(action)
			if (action == "data") {

				popupinner.append("div.g-bold").html("Data request processed <div class='g-check'>✅</div>")
				popupinner.append("div.g-text").html("An email has been sent to you with the data attached.")

			} else if (action == "copy") {

				popupinner.append("div.g-bold").html("Copy request processed <div class='g-check'>✅</div>")
				popupinner.append("div.g-text").html("An email has been sent to you with a copy of the document attached.")

			} else {

				popupinner.append("div.g-bold").html("Original request processed <div class='g-check'>✅</div>")
				popupinner.append("div.g-text").text("A copy of the original document will be delivered to you within three working days. An email has been sent to you with the relevant information.")

			}
	

		// }

	}



})

function sendMail() {


	Email.send({
	    SecureToken : "746b9243-99da-4894-a342-ed3c62e6da59",
	    To : 'kkrebeccalai@gmail.com',
	    From : "sunlai@trm.com.hk",
	    Subject : "Data request for 154170-RAI XXXX XXXX-20201210-LETTER-FROM LD",
	    Body : "This is the data for 154170-RAI XXXX XXXX-20201210-LETTER-FROM LD"
	}).then(
	  message => alert(message)
	);
}