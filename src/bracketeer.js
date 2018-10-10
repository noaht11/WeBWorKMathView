console.log("[WeBWorK MathView] bracketeer.js");

var Bracketeer = new function () {

    this.measureText = function (text, font) {
        text = text.replace(/ /g, "&nbsp;");
        var tmpDiv = document.createElement('div');
    
        document.body.appendChild(tmpDiv);
    
        tmpDiv.style.font = font;
        tmpDiv.style.position = "absolute";
        tmpDiv.style.left = -1000;
        tmpDiv.style.top = -1000;
    
        tmpDiv.innerHTML = text;
    
        var result = {
            width: tmpDiv.clientWidth,
            height: tmpDiv.clientHeight
        };
    
        document.body.removeChild(tmpDiv);
        tmpDiv = null;
    
        return result;
    };
};