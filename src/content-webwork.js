console.log("[WeBWorK MathView] content-webwork.js");

// Prepare function to setup MathView on a webwork page
var webworkSetup = function() {
    MathViewUtils.onMathViewReady(function() {    
        console.log("[WeBWorK MathView] Inserting MathView elements");
        // Get all answer fields (they seem to all have the CSS class name "codeshard")
        var inputs = document.getElementsByClassName("codeshard");
        for (var i = 0; i < inputs.length; i++) {
            var theInput = inputs[i];
            var aMath = theInput.value;
    
            var mathView = MathView.createMathView(i, theInput);
    
            // Insert the math containers directly after the text input
            theInput.parentNode.insertBefore(mathView, theInput.nextSibling);
            MathView.updateMath(i, aMath);
        }
        console.log("[WeBWorK MathView] Rendered");
    });
};

// Inject MathView with the webwork setup function
MathViewExt.inject(webworkSetup);