console.log("[WeBWorK MathView] math-view-ext.js");

var MathViewExt = new function () {
    
    // ID of the script element that is loading math-view.js
    var MV_SCRIPT_ID = "mv_script";
    // IDs of the script elements that are loading dependencies
    var MV_SCRIPT_ID_KATEX = "mv_script_katex";
    var MV_SCRIPT_ID_ASCIIMATH = "mv_script_asciimath";

    /**
     * Returns the full path to the desired resource (accounting for chrome extension URLs)
     * @param {string} path the relative path of the resource
     */
    var getResourcePath = function (path) {
        if (chrome.runtime.getURL) {
            return chrome.runtime.getURL(path);
        } else {
            return path;
        }
    };
    
    /**
     * Inserts required scripts/css files into the webpage.
     */
    var injectDependencies = function () {
        // MathView CSS
        var mvCSS = document.createElement("link");
        mvCSS.rel = "stylesheet";
        mvCSS.type = "text/css";
        mvCSS.href = getResourcePath("math-view.css");
        (document.head || document.documentElement).appendChild(mvCSS);

        // KaTeX JS
        var katexJS = document.createElement("script");
        katexJS.id = MV_SCRIPT_ID_KATEX;
        katexJS.src = getResourcePath("katex/katex.min.js");
        //katexJS.defer = "defer"; // We don't actually need to defer these scripts because we're using listeners on the load events
        (document.head || document.documentElement).appendChild(katexJS);

        // KaTeX CSS
        var katexCSS = document.createElement("link");
        katexCSS.rel = "stylesheet";
        katexCSS.type = "text/css";
        katexCSS.href = getResourcePath("katex/katex.css");
        (document.head || document.documentElement).appendChild(katexCSS);

        // ASCIIMathTeXImg JS
        var asciiMathJS = document.createElement("script");
        asciiMathJS.id = MV_SCRIPT_ID_ASCIIMATH;
        asciiMathJS.src = getResourcePath("asciimath-based/ASCIIMathTeXImg.js");
        //asciiMathJS.defer = "defer"; // We don't actually need to defer these scripts because we're using listeners on the load events
        (document.head || document.documentElement).appendChild(asciiMathJS);
        
        // MathView itself (this script)
        var mathViewJS = document.createElement("script");
        mathViewJS.id = MV_SCRIPT_ID;
        mathViewJS.src = getResourcePath("math-view.js");
        (document.head || document.documentElement).appendChild(mathViewJS);
    };

    /**
     * Injects the provided script text into the current webpage inside of a <script> tag in the <head> element
     * @param {string} scriptText the literal text content of the script to inject
     */
    var injectInlineScriptText = function (scriptText) {
        var script = document.createElement("script");
        script.textContent = scriptText;
        (document.head || document.documentElement).appendChild(script);
    };

    /**
     * Injects MathView's required JS and CSS references into the current webpage.
     * Injects MathViewUtils and a setup script that uses the provided setup function.
     * @param {Function} setup a setup function that will be immediately invoked once it is injected into the webpage.
     *                         Only MathViewUtils is guaranteed to be available at the time of invocation.
     *                         Use MathViewUtils.onMathViewReady(...) in your setup function if you need access to a MathView reference.
     */
    this.inject = function (setup) {
        var doInjection = function () {
            console.log("[WeBWorK MathView] Injecting MathView");
            // Inject all dependencies
            injectDependencies();

            // Convert function to text and combine with MathViewUtils declaration
            var setupScript = "(" + MathViewUtilsWrapper + ")();";
            setupScript += "(" + setup + ")();";

            // Inject setup script
            injectInlineScriptText(setupScript);
        }

        if (document.head || document.documentElement) {
            doInjection();
        }
        else {
            console.log("[WeBWorK MathView] DOM not available. Waiting to inject MathView...");
            document.addEventListener("DOMContentLoaded", function() {
                console.log("[WeBWorK MathView] DOM available");
                doInjection();
            });
        }
    };
}