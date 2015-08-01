// message if no favorites
var no_favs = createTemplate('templates/no_favorites.html', null);

// some useful variables
var prompted, searched = 0;

function checkIfFavorites( fromStorage ) {
    if ($('#favorites-bar .fav-list li').length === 0) {
        $('#favorites-bar .fav-list').append(no_favs);
        $('#favorites-bar').addClass('no-favorites');
    }

    if(fromStorage && !$('#favorites-bar .fav-list li').has('p').length) {
        $('label[for="favorites-toggle"]').addClass('in');        
    }
}

function viewThis(tag_name) {
    $('#search :text').val(tag_name.toLowerCase());
    $('#search :submit').click();
    // just in case the favorites bar is open.. close it
    $('#favorites-toggle').prop('checked', false);
}

function copyThis(tag_name) {
    var usage = localStorage.getItem(tag_name);
    usage = JSON.parse(usage).usage;
    window.prompt("Press Ctrl+C or Command + Enter to Copy to clipboard", usage);
}

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
        checkIfFavorites(false);
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

function storageListerner(storageEvent) {
    alert(storageEvent)
}

window.addEventListener('storage', storageListerner, false);

function bindFavoriteOps() {
    $('.fav-button').click(function(ev) {
        ev.preventDefault();
        //  check if browser supports local storage
        if (typeof(Storage) == "undefined") {
            alert('Your browser does not support local storage.  Please use a modern browser to enable favoriting.');
            return;
        }

        var obj = {};

        var tag_name = $('.snipp-card h3').text();


        if (localStorage.hasOwnProperty(tag_name)) {
            // remove from local storage and update color
            // alert('removed from local storage');
            $(this).text('Favorite');
            $(this).removeClass('favorited');
            // $('label[for="favorites-toggle"]').removeClass('in');

            localStorage.removeItem(tag_name);
            // remove from the favortites bar
            $('#' + tag_name + '_').remove();
            checkIfFavorites(false);

        } else {
            // add to local storage, update colors, and add notification to fav-bar toggle
            // alert('added to local storage');
            $('#favorites-toggle').prop('checked', false);
            $(this).text('Favorited!');
            $(this).addClass('favorited');
            $('label[for="favorites-toggle"]').addClass('in');

            var map = {
                '&lt;': '<',
                '&gt;': '>',
                '<br>': '\n'
            }

            // build the object for storage
            obj.tag_name = tag_name;
            obj.usage = $('code').text().replace(/&lt;|&gt;|<br>/gi, function(matched) {
                return map[matched];
            });;

            // console.log(obj);
            // save to local storage
            localStorage.setItem(obj.tag_name, JSON.stringify(obj));

            var tag_name = obj.tag_name;
            addToBar(tag_name, false);
        };

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
                // insert the card
                addToBar(cur.tag_name, true);
            }


        }
    }

} else {
    // if not, remove favorite buttons and notify user in favorite bar
    alert('Local storage doesn\'t exists');
}

checkIfFavorites(true)
bindFavoriteOps();