(function() {

    // append a class to html if it is a touch screen
    var is_touch = ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch);
    console.log(is_touch);

    var root = document.getElementsByTagName('html')[0];

    if (!is_touch) {
        root.setAttribute('class', 'no-touch');
    } else {
        root.setAttribute('class', 'touch');
    }

})();