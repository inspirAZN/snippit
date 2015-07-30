// wait for the page to load first
$(function() {

    var ref = new Firebase('https://snippit134.firebaseio.com/');
    var results = [];

    $('#search').submit(function(e) {
        e.preventDefault();
        // show the loader
        $('#loader').attr('class', 'visible');
        $('#banner h1').css('line-height', '80px');

        // ajax call.  remove loader and display result after
        var search_str = $('#search :text').val();
        performSearch(search_str).done(displayResults);
    });


    var performSearch = function(search_str) {
        // create a deferred object
        var r = $.Deferred();

        // Clear previous results
        results = [];

        //Perform query (this is performed multiple times for each result)
        ref.orderByChild("tagname").equalTo(search_str).on("child_added", function(snapshot) {

        	var result = snapshot.val();

            // escape characters of usage
            var map = {
                '<': '&lt;',
                '>': '&gt;',
                '\n': '<br>'
            }

            var code = result.textarea;

            code = code.replace(/<|>|\n/gi, function(matched) {
                return map[matched];
            });

            result.textarea = code;
            results.push(result);
        });

        setTimeout(function() {
            // and call `resolve` on the deferred object, once you're done
            r.resolve();
        }, 500);

        // return the deferred object
        return r;
    };

    // after performSearch is done
    var printResults = function() {
        if (results.length === 0) {
            console.log("No matches found.");
        } else {
            console.log("Search results found.");
            console.log(results);
        }
    };

    var displayResults = function() {
        if (results.length === 0) {
            console.log("No matches found.");
        } else if (results.length > 1) {
            console.log("Multiple results found.");
            console.log(results);
        } else {
            var html = createTemplate('templates/snipp_tmpl.html', results[0]);
            $('#loader').attr('class', 'not-visible');
            $('hr').attr('class', 'visible');
            $('#result-field').attr('class', 'visible');
            $('#result').html(html);
            bindFavoriteOps();
        }
    }


});