var row_number;
function addRows(input) {
	row_number = Math.floor(input.length / 3) + 1;
	for (var i = 0; i < row_number; i ++) {
		$('#work').append("<div class='row'></div>");
	}
}


var months = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
function fillPage(input) {

	for (var i = 0; i < input.length; i++) {

		if (input[i].link.indexOf("https://www.nytimes.com/interactive/") > -1) {
			date = input[i].link.split("https://www.nytimes.com/interactive/")[1].split("/");
			date = months[+date[1]-1] + " " + Number(date[2]) + ", " + date[0];
		}

		row = Math.floor(i/3) + 1;
		$('#work .row:nth-child(' + row + ')').append('<div class="span4"><a href="' + input[i].link + '" target="_blank"><h2>' + input[i].title + '</h2></a><a href="' + input[i].link + '" target="_blank"><div class="wrapper"><img src="' + input[i].imglink + '"></div></a></div>');
	}
	footer();
}

function footer() {
	$('footer').append('<p>&copy; KK Rebecca Lai</p>');
}