var MathView = new function () {

    var USE_MATHJAX_BACKUP = false && (window.MathJax != undefined);

    var MV_CSS_CLASS_MATH_OUT = "mv_mathout";
    var MV_MATH_OUT_ID_PRE = "mv_out";

    var getResourcePath = function (path) {
        if (chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
        } else {
            return path;
        }
    };

    /**
     * Injects MathView itself (math-view.js) as well as all its dependencies into the current webpage
     */
    this.inject = function() {        
        // Inject MathView itself (this script) into the webpage
        var mathViewJS = document.createElement("script");
        mathViewJS.src = getResourcePath("math-view.js");
        document.head.appendChild(mathViewJS);

        // Inject all dependencies
        this.load();
    };

    /**
     * Injects required scripts/css files into the webpage.
     * 
     * Wait until the load event has fired to use MathView.updateMath(id, amath).
     */
    this.load = function () {
        // MathView CSS
        var mvCSS = document.createElement("link");
        mvCSS.rel = "stylesheet";
        mvCSS.type = "text/css";
        mvCSS.href = getResourcePath("math-view.css");
        document.head.appendChild(mvCSS);

        // KaTeX JS
        var katexJS = document.createElement("script");
        katexJS.src = getResourcePath("katex/katex.min.js");
        document.head.appendChild(katexJS);

        // KaTeX CSS
        var katexCSS = document.createElement("link");
        katexCSS.rel = "stylesheet";
        katexCSS.type = "text/css";
        katexCSS.href = getResourcePath("katex/katex.css");
        document.head.appendChild(katexCSS);

        // ASCIIMathTeXImg JS
        var asciiMathJS = document.createElement("script");
        asciiMathJS.src = getResourcePath("asciimath-based/ASCIIMathTeXImg.js");
        document.head.appendChild(asciiMathJS);
    };

    var generateMathViewId = function (id, subIndex) {
        return MV_MATH_OUT_ID_PRE + id + "_" + subIndex;
    };

    /**
     * Creates a sub div for holding math output
     * @param {number} id the id of the corresponding input
     * @param {string} subIndex another identifier that should be unique within a single id
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
     * Creates and styles a <div> element to serve as a container for math-formatted text
     * @param {number} id the id of the corresponding input
     * @param {Element} inputSource 
     */
    this.createMathView = function (id, inputSource) {
        // Attach the onkeyup event
        inputSource.addEventListener("keyup", function () {
            MathView.updateMath(id, this.value);
        });

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
    };

    var hideOutput = function (element) { element.style.display = "none"; };
    var showOutput = function (element) { element.style.display = "inline-block"; };
    var updateTextMathJax = function (element, amath) { element.textContent = "`" + amath + "`"; };

    /**
     * Renders the provided AsciiMath into the MathView with the provided id
     * @param {number} id the id of the MathView in which to display the rendered math
     * @param {string} amath the AsciiMath to render
     */
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
                MathJax.Hub.Queue([hideOutput, outB], [updateTextMathJax, outB, amath], ["Typeset", MathJax.Hub, outB], [showOutput, outB],
                    [hideOutput, outA], [updateTextMathJax, outA, amath], ["Typeset", MathJax.Hub, outA], [showOutput, outA], [hideOutput, outB]);
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