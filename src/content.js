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

    var USE_MATHJAX_BACKUP = true;

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
                outA.textContent = amath;
            }
        }
    }
});

/**
 * Creates and styles a <div> element to serve as a container for math-formatted text
 * @param {number} i the index of the corresponding input
 * @param {string} subIndex another identifier that should be unique within a single index
 * @param {string} amath the default AsciiMath text to insert in the <div>
 */
function createMathOutDiv(i, subIndex, amath)
{
    var theMathJaxOut = document.createElement("div");
    theMathJaxOut.id = "wwLive_out_" + i + "_" + subIndex;
    theMathJaxOut.style.display = "inline-block"; // so that it appears on the same line
    theMathJaxOut.style.padding = "8px";
    theMathJaxOut.style.color = "#000000";
    theMathJaxOut.style.backgroundColor = "#dddddd";
    theMathJaxOut.textContent = amath;

    return theMathJaxOut;
}

// Get all answer fields (they seem to all have the class name "codeshard")
var inputs = document.getElementsByClassName("codeshard");
for(var i = 0; i < inputs.length; i++)
{
    var theInput = inputs[i];

    // Set a unique identifier on the field (so we can reference it later)
    theInput.setAttribute("wwLive_index", i);

    // Attach the onkeyup event to call our injected handler
    var updateMathFuncCall = "UpdateMath(" + i + ", this.value)";
    theInput.setAttribute("onkeyup", updateMathFuncCall);

    // Create two math containers (a redundant one for while the other is updating if we're using MathJax)
    var theMathOutA = createMathOutDiv(i, "a", theInput.value);
    var theMathOutB = createMathOutDiv(i, "b", theInput.value);
    theMathOutB.style.display = "none";

    // Parent <div> for the two math containers
    var theMathOut = document.createElement("div");
    theMathOut.style.display = "inline-block";

    theMathOut.appendChild(theMathOutA);
    theMathOut.appendChild(theMathOutB);

    // Insert the math containers directly after the text input
    theInput.parentNode.insertBefore(theMathOut, theInput.nextSibling);

    try
    {
        // First try to render using LaTeX (way faster than MathJax)
        var texstring = AMTparseMath(theInput.value);
        katex.render(texstring, theMathOutA);
        katex.render(texstring, theMathOutB);
    }
    catch(err)
    {
        console.log(err);
        if(USE_MATHJAX_BACKUP)
        {
            // If LaTeX failed (since it doesn't support quite as many functions) revert to MathJax
            theMathOutA.textContent = "`" + theInput.value + "`";        
            theMathOutB.textContent = "`" + theInput.value + "`";
        }
        else
        {
            theMathOutA.textContent = theInput.value;
        }
    }
}

// Inject KaTeX script into the webpage
var katexJS = document.createElement("script");
katexJS.src = chrome.runtime.getURL("katex/katex.min.js");
document.head.appendChild(katexJS);

// Inject KaTeX css into the webpage
var katexCSS = document.createElement("link");
katexCSS.rel = "stylesheet";
katexCSS.type = "text/css";
katexCSS.href = chrome.runtime.getURL("katex/katex.css");
document.head.appendChild(katexCSS);

// Inject ASCIIMathTeXImg script into the webpage
var asciiMathJS = document.createElement("script");
asciiMathJS.src = chrome.runtime.getURL("asciimath-based/ASCIIMathTeXImg.js");
document.head.appendChild(asciiMathJS);