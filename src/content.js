var USE_MATHJAX_BACKUP = false;

/**
 * Injects the provided function into the current webpage inside of a <script> tag in the <head> element
 * @param {Function} func the function to inject
 */
function injectScript(func)
{
    var actualCode = '(' + func + ')();'
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
}

// Inject the onkeyup event handler into the webpage
injectScript(function()
{
    var getOutput = function(i, subIndex) {return document.getElementById("wwLive_out_" + i + "_" + subIndex);};

    var hideOutput = function(element) {element.style.display = "none";};
    var showOutput = function(element) {element.style.display = "inline-block";};
    var updateText = function(element, amath) {element.textContent = "`" + amath +  "`";};

    var USE_MATHJAX_BACKUP = false;

    window.UpdateMath = function(i, amath)
    {
        var outA = getOutput(i, "a");
        var outB = getOutput(i, "b");

        try
        {
            var texstring = AMTparseMath(amath);
            hideOutput(outB);
            katex.render(texstring, outB);
            showOutput(outB);
            hideOutput(outA);
            katex.render(texstring, outA);
            showOutput(outA);
            hideOutput(outB);
        }
        catch(err)
        {
            console.log(err);
            if(USE_MATHJAX_BACKUP)
            {
                MathJax.Hub.Queue([hideOutput, outB], [updateText, outB, amath], ["Typeset", MathJax.Hub, outB], [showOutput, outB],
                                  [hideOutput, outA], [updateText, outA, amath], ["Typeset", MathJax.Hub, outA], [showOutput, outA], [hideOutput, outB]);
            }
            else
            {
                if(amath.length > 0)
                {
                    outA.textContent = amath;
                }
                else
                {
                    outA.innerHTML = "&nbsp;"; // Add a space so the box retains its height
                }
            }
        }
    }
});

/**
 * Creates and styles a <div> element to serve as a container for math-formatted text
 * @param {number} i the index of the corresponding input
 * @param {string} subIndex another identifier that should be unique within a single index
 * @param {string} aMath the default AsciiMath text to insert in the <div>
 */
function createMathOutDiv(i, subIndex, aMath)
{
    var mathOut = document.createElement("div");
    mathOut.id = "wwLive_out_" + i + "_" + subIndex;
    mathOut.className = CSS_MATH_OUT;
    mathOut.textContent = aMath;

    return mathOut;
}

function setup()
{
    // Get all answer fields (they seem to all have the class name "codeshard")
    var inputs = document.getElementsByClassName("codeshard");
    for(var i = 0; i < inputs.length; i++)
    {
        var theInput = inputs[i];
        var aMath = theInput.value;

        // Set a unique identifier on the field (so we can reference it later)
        theInput.setAttribute("wwLive_index", i);

        // Attach the onkeyup event to call our injected handler
        var updateMathFuncCall = "UpdateMath(" + i + ", this.value)";
        theInput.setAttribute("onkeyup", updateMathFuncCall);

        // Create two math containers (a redundant one for while the other is updating if we're using MathJax)
        var mathOutA = createMathOutDiv(i, "a", theInput.value);
        var mathOutB = createMathOutDiv(i, "b", theInput.value);
        mathOutB.style.display = "none";

        // Parent <div> for the two math containers
        var mathOut = document.createElement("div");
        mathOut.style.display = "inline-block";

        mathOut.appendChild(mathOutA);
        mathOut.appendChild(mathOutB);

        // Insert the math containers directly after the text input
        theInput.parentNode.insertBefore(mathOut, theInput.nextSibling);

        try
        {
            // First try to render using LaTeX (way faster than MathJax)
            var texstring = AMTparseMath(aMath);
            katex.render(texstring, mathOutA);
            katex.render(texstring, mathOutB);
        }
        catch(err)
        {
            console.log(err);
            if(USE_MATHJAX_BACKUP)
            {
                // If LaTeX failed (since it doesn't support quite as many functions) revert to MathJax
                mathOutA.textContent = "`" + aMath + "`";        
                mathOutB.textContent = "`" + aMath + "`";
            }
            else
            {
                if(aMath.length > 0)
                {
                    mathOutA.textContent = aMath;
                }
                else
                {
                    mathOutA.innerHTML = "&nbsp;"; // Add a space so the box retains its height
                }
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", setup);