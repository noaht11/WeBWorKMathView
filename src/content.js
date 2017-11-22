function injectScript(func)
{
    var actualCode = '(' + func + ')();'
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head||document.documentElement).appendChild(script);
}

injectScript(function()
{
    var getOutput = function(i, subIndex) {return document.getElementById("wwLive_out_" + i + "_" + subIndex);};

    var hideOutput = function(element) {element.style.display = "none";};
    var showOutput = function(element) {element.style.display = "inline-block";};
    var updateText = function(element, amath) {element.textContent = "`" + amath +  "`";};

    window.UpdateMath = function(i, amath)
    {
        var outA = getOutput(i, "a");
        var outB = getOutput(i, "b");

        try
        {
            var texstring = AMTparseMath(amath);
            katex.render(texstring, outA);
        }
        catch(err)
        {
            MathJax.Hub.Queue([hideOutput, outB], [updateText, outB, amath], ["Typeset", MathJax.Hub, outB], [showOutput, outB],
                          [hideOutput, outA], [updateText, outA, amath], ["Typeset", MathJax.Hub, outA], [showOutput, outA], [hideOutput, outB]);
        }
    }
});

function createMathJaxOutDiv(i, subIndex, amath)
{
   var theMathJaxOut = document.createElement("div");
   theMathJaxOut.id = "wwLive_out_" + i + "_" + subIndex;
   theMathJaxOut.style.display = "inline-block";
   theMathJaxOut.style.padding = "8px";
   theMathJaxOut.style.color = "#000000";
   theMathJaxOut.style.backgroundColor = "#dddddd";
   theMathJaxOut.textContent = amath;

   return theMathJaxOut;
}

var inputs = document.getElementsByClassName("codeshard");
for(var i = 0; i < inputs.length; i++)
{
   var theInput = inputs[i];
   theInput.setAttribute("wwLive_index", i);

   var updateMathFuncCall = "UpdateMath(" + i + ", this.value)";
   theInput.setAttribute("onkeyup", updateMathFuncCall);

   var theMathJaxOut = document.createElement("div");
   theMathJaxOut.style.display = "inline-block";

   var theMathJaxOutA = createMathJaxOutDiv(i, "a", theInput.value);
   var theMathJaxOutB = createMathJaxOutDiv(i, "b", theInput.value);
   theMathJaxOutB.style.display = "none";

   theMathJaxOut.appendChild(theMathJaxOutA);
   theMathJaxOut.appendChild(theMathJaxOutB);
   
   theInput.parentNode.insertBefore(theMathJaxOut, theInput.nextSibling);

   try
   {
       var texstring = AMTparseMath(theInput.value);
       katex.render(texstring, theMathJaxOutA);
   }
   catch(err)
   {
       theMathJaxOutA.textContent = "`" + theInput.value + "`";        
       theMathJaxOutB.textContent = "`" + theInput.value + "`";
   }
}

var script = document.createElement("script");
script.src = chrome.runtime.getURL("katex/katex.min.js");
document.head.appendChild(script);

var script = document.createElement("script");
script.src = chrome.runtime.getURL("ASCIIMathTeXImg.js");
document.head.appendChild(script);
