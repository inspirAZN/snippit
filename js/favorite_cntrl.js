$(function() {

	// html if no favorites
	var no_favs = '<li>You currently have no favorites.  Search for a term and click "Favorite".</li>'

	// binds the click function after it is rendered
	function bindActions() {
		$('.snippit-shortcut .delete-this').click(function(ev) {
			ev.preventDefault();
			// delete from local storage
			var tag_name = $(this).closest('.snippit-shortcut').children('.term').text();
			localStorage.removeItem(tag_name);
			// remove from the favortites bar
			$(this).closest('.snippit').remove();
			if( $('#favorites-bar ul li').length === 0 ) {
				$('#favorites-bar ul').append(no_favs);
			}
		});

		$('.snippit-shortcut .copy-this').click(function(ev) {
			// get the usage from local storage
			var tag_name = $(this).closest('.snippit-shortcut').children('.term').text();
			// turn it into json to access fields
			var usage = localStorage.getItem(tag_name);
				usage = JSON.parse(usage).usage;

		    window.prompt("Press Ctrl+C or Command + Enter to Copy to clipboard", usage);	

		});
	}

	function addToBar(tag_name, fromStorage) {
		if($('#favorites-bar').hasClass('no-favorites')) {
			$('#favorites-bar ul li').remove();
			$('#favorites-bar').removeClass('no-favorites') ;
		}

		// snip card template
		var className = 'snippit';
		if( !fromStorage ) {
			className += ' new';
		}
		var snipp = '<li class="'+className+'">';
			snipp += '<div class="snippit-shortcut">';
			snipp += '<span class="term">' + tag_name + '</span>';
			snipp += '<ul class="actions">';
			snipp += '<li><a href="#" class="view-this">View</a></li>';
			snipp += '<li><a href="#" class="copy-this">Copy</a></li>';
			snipp += '<li><a href="#" class="delete-this">&times;</a></li>';
			snipp += '</ul></div></li>';

		$('.favorites-cards ul').append(snipp);

		// bind the click functions
		bindActions();
	}

    $('.fav-button').click(function(ev) {
        ev.preventDefault();
        //  check if browser supports local storage
        if (typeof(Storage) == "undefined") {
            alert('Your browser does not support local storage.  Please use a modern browser to enable favoriting.');
            return;
        }

        var obj = {};

        if ($(this).hasClass('favorited')) {
            // remove from local storage and update color
            // alert('removed from local storage');
            $(this).text('Favorite');
            $('label[for="favorites-toggle"]').removeClass('in');

        } else {
            // add to local storage, update colors, and add notification to fav-bar toggle
            // alert('added to local storage');
            $(this).text('Favorited!');
            $('label[for="favorites-toggle"]').addClass('in');

            var map = {
                '&lt;': '<',
                '&gt;': '>',
                '<br>': '\n'
            }

            // build the object for storage
            obj.tag_name = $('.snipp-card h3').text();
            obj.usage = $('code').text().replace(/&lt;|&gt;|<br>/gi, function(matched) {
                return map[matched];
            });;

            // console.log(obj);
            // save to local storage
            localStorage.setItem(obj.tag_name, JSON.stringify(obj));
            console.log(localStorage.getItem(obj.tag_name));
            var tag_name = obj.tag_name;
            addToBar(tag_name, false);
        }
        // update color
        $(this).toggleClass('favorited');

    });

    // show or remove notifications from favorites bar
    $('#favorites-toggle').click(function(ev) {
        var label = $('label[for="favorites-toggle"]');
        if (this.checked && label.hasClass('in')) {
            // the bar is open, remove main notification
            label.toggleClass('in');
        } else if (!this.checked && $('.snippit').hasClass('new')) {
            // the bar is closed, remove new indicators from new favorites
            $('.snippit').toggleClass('new');
        }
    })

    // check if broswer supports local storage
    if (typeof(Storage) !== "undefined") {
        // detect if any favorites
        if (localStorage.length > 1) {
            for (var i = 0; i < localStorage.length; i++) {
                var cur = localStorage.getItem(localStorage.key(i));
                cur = JSON.parse(cur);
                // skip firebase stuff
                if (cur.tag_name) {
                    
                    // insert the card
                    addToBar(cur.tag_name,true);
                }


            }
        } else {
        	// no favorites
        	$('#favorites-bar').addClass('no-favorites');
        	$('#favorites-bar ul').append(no_favs);
        } 

    } else {
        // if not, remove favorite buttons and notify user in favorite bar
        alert('Local storage doesn\'t exists');
    }

});