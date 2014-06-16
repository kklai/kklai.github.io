var row_number;
function addRows(input) {
	row_number = Math.floor(input.length / 3) + 1;
	for (var i = 0; i < row_number; i ++) {
		$('#work').append("<div class='row'></div>");
	}
}

function fillPage(input) {
	for (var i = 0; i < 3; i++) {
		$('#work .row:first').append('<div class="span4"><a href="' + input[i].link + '" target="_blank"><h2>' + input[i].title + '</h2></a><a href="' + input[i].link + '" target="_blank"><img src="' + input[i].imglink + '"></a><p><span class="pub">' + input[i].pub + '</span>' + input[i].description + '</p></div>');
	}
	for (var i = 3; i < input.length; i++) {
		row = Math.floor(i/3) + 1;
		$('#work .row:nth-child(' + row + ')').append('<div class="span4"><a href="' + input[i].link + '" target="_blank"><h2>' + input[i].title + '</h2></a><a href="' + input[i].link + '" target="_blank"><img src="' + input[i].imglink + '"></a><p><span class="pub">' + input[i].pub + '</span>' + input[i].description + '</p></div>');
	}
	footer();
}

function footer() {
	$('footer').append('<p>&copy; KK Rebecca Lai</p>');
}