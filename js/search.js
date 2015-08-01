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

    var displayResults = function() {
        hideLoader();
        var html;
        if (results.length === 0) {
            html = createTemplate('templates/no_results.html', null);
        } else if (results.length > 1) {
            console.log("Multiple results found.");
            console.log(results);
        } else {
            html = createTemplate('templates/snipp_tmpl.html', results[0]);
        }
        showDOM(html);
        bindFavoriteOps();
    }

    var showDOM = function(html) {
        $('#result-field').removeClass('drop-out not-visible').addClass('fade-in');
        $('#result').html(html);
    }
    var dropDOM = function() {
        $('#result-field').removeClass('fade-in').addClass('drop-out');
    }

    var showLoader = function() {
        $('#banner h1').css('line-height', '50px');
        $('hr').attr('class', 'visible');
        $('#loader').addClass('visible');
    }

    var hideLoader = function() {
        $('#loader').removeClass('visible'); 
    }

});