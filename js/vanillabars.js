// an HTML template engine based on http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
// create a template out of the passed in html string


var createTemplate = function(html, options) {

    // get the content of the html file specified
    var loadPage = function(href) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", href, false);
        xmlhttp.send();
        // if its not a file, treat it as html string
        if(xmlhttp.status === 404) {
            return href;
        }
        return xmlhttp.responseText;
    }

    // get the html in there
    html = loadPage(html);

    // regular expressions to detect <% %> tags and also code blocks
    var re = /<%([^%>]+)?%>/g,
        reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
        code = 'var r=[];\n',
        cursor = 0,
        match;

    // function create a string to be converted into a function
    var add = function(line, js) {
        js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }

    // loop through while you find the template expressions
    while (match = re.exec(html)) {
        // add the mached element to the function
        add(html.slice(cursor, match.index))(match[1], true);
        // update the cursor
        cursor = match.index + match[0].length;
    }
    // add the rest of the html
    add(html.substr(cursor, html.length - cursor));
    // add the return to the function
    code += 'return r.join("");';

    // return the dynamically created function and apply the options
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}