console.log("[WeBWorK MathView] content-webwork.js");

// Prepare function to setup MathView on a webwork page
var webworkSetup = function () {
    MathViewUtils.onMathViewReady(function () {
        var applyToInputs = function (inputs) {
            console.log("[WeBWorK MathView] Inserting MathView elements");
            for (var i = 0; i < inputs.length; i++) {
                var theInput = inputs[i];

                // Only attach a MathView if one hasn't already been attached
                if (!MathView.hasMathView(theInput)) {
                    var aMath = theInput.value;
            
                    var mathView = MathView.createMathView(i, theInput);
            
                    // Insert the math containers directly after the text input
                    theInput.parentNode.insertBefore(mathView, theInput.nextSibling);
                    MathView.updateMath(i, aMath);
                }
            }
            console.log("[WeBWorK MathView] Rendered");
        }

        var retrieveInputs = function () {
            // Get all answer fields (they seem to all have the CSS class name "codeshard")
            return document.getElementsByClassName("codeshard");
        }

        var inputs = retrieveInputs();

        if (inputs.length == 0) {
            // If no inputs are found, wait until the DOMContentLoaded event fires to search for them
            console.log("[WeBWorK MathView] DOM not available. Waiting to insert MathView elements...");
            document.addEventListener("DOMContentLoaded", function () {
                console.log("[WeBWorK MathView] DOM available");
                applyToInputs(retrieveInputs());
            })
        }
        else {
            // If we found inputs go ahead and attach MathViews to them immediately
            applyToInputs(inputs);
        }
    });
};

// Inject MathView with the webwork setup function
MathViewExt.inject(webworkSetup);