// message if no favorites
var no_favs = createTemplate('templates/no_favorites.html', null);

// some useful variables
var prompted, searched = 0;

// binds the click function after it is rendered
function bindActions() {
    // bind the delete function
    $('.snippit-shortcut').on('click', '.delete-this', function(ev) {
        ev.preventDefault();
        // delete from local storage
        var tag_name = $(this).closest('.snippit-shortcut').children('.term').text();
        localStorage.removeItem(tag_name);
        // remove from the favortites bar
        $(this).closest('.snippit').remove();
        if ($('#favorites-bar .fav-list li').length === 0) {
            $('#favorites-bar .fav-list').append(no_favs);
            $('#favorites-bar').addClass('no-favorites');
        }
    });

    // bind the copy function
    $('.snippit-shortcut').on('click', '.copy-this', function(ev) {
        ev.preventDefault();

        // get the index of the clicked element
        var index = $(this).closest('.snippit').index();
        var num_favs = $('.snippit').size();

        // stop from prompting for each button after
        if (prompted === 0) {
            // get the usage from local storage
            var tag_name = $(this).closest('.snippit-shortcut').children('.term').text();
            // turn it into json to access fields
            var usage = localStorage.getItem(tag_name);
            usage = JSON.parse(usage).usage;

            window.prompt("Press Ctrl+C or Command + Enter to Copy to clipboard", usage);
            prompted = index + 1;
        } else if (prompted >= 1) {
            prompted++;
        }
        if (prompted === num_favs) {
            prompted = 0;
        }
    });

    // bind the view function
    $('.snippit-shortcut').on('click', '.view-this', function(ev) {
        ev.preventDefault();

        // get the index of the clicked element
        var index = $(this).closest('.snippit').index();
        var num_favs = $('.snippit').size();

        // stop from searching for each button after
        if (searched === 0) {
            // get the term
            var search = $(this).closest('.snippit-shortcut').children('.term').text();
            // just put the term in the search bar and submit the form
            $('#search :text').val(search);
            $('#search :submit').click();

            searched = index + 1;

        } else if (searched >= 1) {
            searched++;
        }
        if (searched === num_favs) {
            searched = 0;
        }
    });
}

function addToBar(tag_name, fromStorage) {
    if ($('#favorites-bar').hasClass('no-favorites')) {
        $('#favorites-bar .fav-list li').remove();
        $('#favorites-bar').removeClass('no-favorites');
    }

    // snip card template
    var className = 'snippit';
    if (!fromStorage) {
        className += ' new';
    }

    // values to populate template
    var options = {
        'className': className,
        'tag_name': tag_name
    };

    var snipp = createTemplate('templates/favorite_tmpl.html', options);

    $('.favorites-cards .fav-list').append(snipp);

    // bind the click functions
    bindActions();
}

function bindFavoriteOps() {
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
            $('.snippit').removeClass('new');
        }
    })
}

// check if broswer supports local storage
if (typeof(Storage) !== "undefined") {
    // detect if any favorites
    if (localStorage.length > 1) {
        for (var i = 0; i < localStorage.length; i++) {
            var cur = localStorage.getItem(localStorage.key(i));
            cur = JSON.parse(cur);
            // skip firebase stuff
            if (cur.tag_name) {
                if( i === 1 ) {
                    $('label[for="favorites-toggle"]').addClass('in');
                }
                // insert the card
                addToBar(cur.tag_name, true);
            }


        }
    }
    if ($('#favorites-bar .fav-list li').size() < 1) {
        // no favorites
        $('#favorites-bar').addClass('no-favorites');
        $('#favorites-bar ul').append(no_favs);
    }

} else {
    // if not, remove favorite buttons and notify user in favorite bar
    alert('Local storage doesn\'t exists');
}

bindFavoriteOps();