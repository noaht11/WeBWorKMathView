// Inject MathView and its dependencies
MathView.inject();

// Inject intialization code to setup all the MathViews
injectScript(function () {    
    var setup = function () {
        // Get all answer fields (they seem to all have the class name "codeshard")
        var inputs = document.getElementsByClassName("codeshard");
        for (var i = 0; i < inputs.length; i++) {
            var theInput = inputs[i];
            var aMath = theInput.value;
    
            var mathView = MathView.createMathView(i, theInput);
    
            // Insert the math containers directly after the text input
            theInput.parentNode.insertBefore(mathView, theInput.nextSibling);
            MathView.updateMath(i, aMath);
        }
    }

    window.addEventListener("load", setup);
});