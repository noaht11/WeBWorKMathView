var MathView = new function () {

    var USE_MATHJAX_BACKUP = false;

    var MV_CSS_CLASS_MATH_OUT = "mv_mathout";
    var MV_MATH_OUT_ID_PRE = "mv_out";

    var generateMathViewId = function (id, subIndex) {
        return MV_MATH_OUT_ID_PRE + id + "_" + subIndex;
    };

    /**
     * Creates and styles a <div> element to serve as a container for math-formatted text
     * @param {number} id the index of the corresponding input
     * @param {string} subIndex another identifier that should be unique within a single index
     * @param {string} defaultAMathVal the default AsciiMath text to insert in the <div>
     */
    var createMathOut = function (id, subIndex, defaultAMathVal) {
        var mathOut = document.createElement("div");
        mathOut.id = generateMathViewId(id, subIndex);
        mathOut.className = MV_CSS_CLASS_MATH_OUT;
        mathOut.textContent = defaultAMathVal;

        return mathOut;
    };

    /**
     * 
     * @param {number} id 
     * @param {Element} inputSource 
     */
    this.createMathView = function (id, inputSource) {
        // Attach the onkeyup event to call our injected handler
        var updateMathFuncCall = "MathView.updateMath(" + id + ", this.value)";
        inputSource.setAttribute("onkeyup", updateMathFuncCall);

        // Create two math containers (a redundant one for while the other is updating if we're using MathJax)
        var mathOutA = createMathOut(id, "a", inputSource.value);
        var mathOutB = createMathOut(id, "b", inputSource.value);
        mathOutB.style.display = "none";

        // Parent <div> for the two math containers
        var mathOut = document.createElement("div");
        mathOut.style.display = "inline-block";

        mathOut.appendChild(mathOutA);
        mathOut.appendChild(mathOutB);

        return mathOut;
    };

    var getMathOut = function (id, subIndex) {
        return document.getElementById(generateMathViewId(id, subIndex));
    }

    var hideOutput = function (element) { element.style.display = "none"; };
    var showOutput = function (element) { element.style.display = "inline-block"; };
    var updateText = function (element, amath) { element.textContent = "`" + amath + "`"; };

    this.updateMath = function (id, amath) {
        var outA = getMathOut(id, "a");
        var outB = getMathOut(id, "b");

        try {
            var texstring = AMTparseMath(amath);
            hideOutput(outB);
            katex.render(texstring, outB);
            showOutput(outB);
            hideOutput(outA);
            katex.render(texstring, outA);
            showOutput(outA);
            hideOutput(outB);
        }
        catch (err) {
            console.log(err);
            if (USE_MATHJAX_BACKUP) {
                MathJax.Hub.Queue([hideOutput, outB], [updateText, outB, amath], ["Typeset", MathJax.Hub, outB], [showOutput, outB],
                    [hideOutput, outA], [updateText, outA, amath], ["Typeset", MathJax.Hub, outA], [showOutput, outA], [hideOutput, outB]);
            }
            else {
                if (amath.length > 0) {
                    outA.textContent = amath;
                }
                else {
                    outA.innerHTML = "&nbsp;"; // Add a space so the box retains its height
                }
            }
        }
    };

};