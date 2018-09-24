console.log("content-wolfram.js");

// Inject MathView and its dependencies
MathView.inject();

// Inject intialization code to setup all the MathViews
injectScript(function () {    
    var setup = function () {
        var queryInput = document.getElementById("query");        
        var aMath = queryInput.value;
    
        var mvId = 0;
        var mathView = MathView.createMathView(mvId, queryInput);

        var formInput = document.getElementById("input");
        var fieldSetMain = document.getElementsByClassName("main")[0];
        formInput.insertBefore(mathView, fieldSetMain.nextSibling);

        MathView.updateMath(mvId, aMath);   
    };

    window.addEventListener("load", setup);
});