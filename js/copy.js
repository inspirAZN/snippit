function copyToClipboard() {
    var map = {
        '&lt;': '<',
        '&gt;': '>',
        '<br>': '\n'
    }

    var code_elem = document.getElementsByTagName('code')[0];
    var code = code_elem.innerHTML;

    code = code.replace(/&lt;|&gt;|<br>/gi, function(matched) {
        return map[matched];
    });

    window.prompt("Copy to clipboard: Ctrl+C, Enter", code);

}