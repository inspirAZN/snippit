// wait for the page to load first
$(function(){

	$('#search').submit( function(e) {
		e.preventDefault();
		// show the loader
		$('#loader').attr('class','visible');
		$('#banner h1').css('line-height', '100px');

		// ajax call.  remove loader and display result after
	});


});