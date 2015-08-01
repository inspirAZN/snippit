// wait for the page to load first
$(function() {

    var ref = new Firebase('https://snippit134.firebaseio.com/');
    var results = [];

    $('#search').submit(function(e) {
        e.preventDefault();
        var search_str = $('#search :text').val();

        performSearch(search_str).done(displayResults);
    });


    var performSearch = function(search_str) {
        // drop the current card and show that loader
        dropDOM();
        showLoader();


        // create a deferred object
        var r = $.Deferred();

        // Clear previous results
        results = [];

        /* Allow <tag> search */
        var search_map = {
            '<': '',
            '>': '',
            '\n': '<br>'
        }
        search_str = search_str.replace(/<|>|\n/gi, function(matched) {
            return search_map[matched];
        });


        //Perform query (this is performed multiple times for each result)
        /*** TAG NAME ***/
        ref.orderByChild("tagname").equalTo(search_str).on("child_added", function(snapshot) {
            var snap_result = snapshot.val();
            pushToResults(snap_result);

        });

        if (results.length == 0) {
            /*** ATTRIBUTES ***/
            ref.on('child_added', function(father) {
                var fatherKeyValue = father.val(); // Object
                father.ref().on('child_added', function(child) {
                    child.ref().orderByChild("name").equalTo(search_str).on('child_added', function(grandchildSnap) {
                        pushToResults(fatherKeyValue);
                    });

                    /*** KEYWORD ***/
                    if (results.length == 0) {
                        child.ref().orderByKey().on('child_added', function(grandchildSnap) {
                            if (grandchildSnap.val() == search_str) {
                                pushToResults(fatherKeyValue);
                            }
                        });
                    }
                });
            });
        }

        // End of Queries

        setTimeout(function() {
            // and call `resolve` on the deferred object, once you're done

            r.resolve();
        }, 1000);

        // return the deferred object
        return r;
    };

    var displayResults = function() {

        var html;
        if (results.length === 0) {
            html = createTemplate('templates/no_results.html', null);
        } else if (results.length > 1) {

            console.log(results);

        } else {
            html = createTemplate('templates/snipp_tmpl.html', results[0]);

        }
        hideLoader();
        showDOM(html);
        bindFavoriteOps();
    }

    var showDOM = function(html) {
        $('#result-field').removeClass('not-visible').addClass('visible');
        $('#result').removeClass('drop-out').addClass('fade-in').html(html);

    }
    var dropDOM = function() {
        $('#result').removeClass('fade-in').addClass('drop-out');

    }

    var showLoader = function() {
        $('#banner h1').css('line-height', '50px');
        $('hr').attr('class', 'visible');
        $('#loader').addClass('visible');

    }

    var hideLoader = function() {
        $('#loader').removeClass('visible');

    }

    var pushToResults = function(snap_result) {
        /* Prevent cross-site scripting */
        var map = {
            '<': '&lt;',
            '>': '&gt;',
            '\n': '<br>'
        }


        var code = snap_result.textarea;

        code = code.replace(/<|>|\n/gi, function(matched) {
            return map[matched];
        });

        snap_result.textarea = code;

        //Results pushed into results array
        results.push(snap_result);
        //console.log(snap_result);


    }

});