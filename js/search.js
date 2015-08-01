// handles all search queries and ui manipulation

// wait for the page to load first
$(function() {

    var ref = new Firebase('https://snippit134.firebaseio.com/');
    var results = [];

    $('#search').submit(function(e) {
        e.preventDefault();
        var search_str = $('#search :text').val().toLowerCase();

        performSearch(search_str).done(displayResults);

    });

    // Perform tag/keyword/attribute search using firebase queries
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
                    child.ref().orderByKey().on('child_added', function(grandchildSnap) {
                        if (grandchildSnap.val() == search_str) {
                            pushToResults(fatherKeyValue);
                        }
                    });

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

    // Display Results onto page
    var displayResults = function() {
        //Remove Duplicates from Results
        results = removeDuplicates(results);

        var html;
        var numresults = results.length;
        var count = '(' + numresults;
        if (numresults === 0) {
            html = createTemplate('templates/no_results.html', null);
            count += ' results)';
        } else if (numresults > 1) {
            html = createTemplate('templates/multiple_results_tmpl.html', results);
            count += ' results)';
        } else {
            html = createTemplate('templates/snipp_tmpl.html', results[0]);
            count += ' result)';
        }
        hideLoader();
        showDOM(html);
        $('#numresults').html(count);
        console.log($('#numresults').html());
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

    // Pushes results of query to Results array
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
    }

    // suggest some tags
    $('#search input:text').on('input', function(e) {
        $('#suggestor').addClass('visible');
        var value = $(this).val();
        $('#suggestor > li').each(function() {
            if ($(this).text().search(value) > -1 ||
                $(this).hasClass('suggestions')) {
                $(this).show();
            } else {
                $(this).hide();
            }
        })
    }).on('keyup', function(e) {
        setTimeout(function() {
            $('#suggestor').removeClass('visible');
        }, 3500)
    });

    function refreshRef(list) {
        var lis = '';
        lis += '<li class="suggestions"><b>Suggestions</b></li>';
        for (var i = 0; i < list.length; i++) {
            lis += '<li onclick="viewThis(\'' + list[i].tagname + '\')">' + list[i].tagname + '</li>';
        };
        $('#suggestor').html(lis);
    };

    // Retrieve data from firebase; creates list[{tagname: tagname, key: key}]
    // this will get fired on inital load as well as when ever there is a change in the data
    ref.on("value", function(snapshot) {
        var data = snapshot.val();
        var list = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                tagname = data[key].tagname ? data[key].tagname : '';
                if (tagname.trim().length > 0) {
                    list.push({
                        tagname: tagname,
                        key: key
                    })
                }
            }
        }
        // refresh the UI
        refreshRef(list);
    });

    // Remove Duplicates in Results Array
    function removeDuplicates(arr) {
        var n, y, x, i, r;
        r = [];
        o: for (i = 0, n = arr.length; i < n; i++) {

            for (x = 0, y = r.length; x < y; x++) {

                if (r[x].tagname == arr[i].tagname) {
                    continue o;
                }
            }
            r.push(arr[i]);
        }
        return r;
    };

});