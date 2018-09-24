console.log("[WeBWorK MathView] math-view-utils.js");

var MathViewUtilsWrapper = function() {
    // Make MathViewUtils a global variable
    MathViewUtils = new function () {

        // These three variables must be consistent with those declared in the math-view-ext.js
        var MV_SCRIPT_ID = "mv_script";
        var MV_SCRIPT_ID_KATEX = "mv_script_katex";
        var MV_SCRIPT_ID_ASCIIMATH = "mv_script_asciimath";
        
        var katexLoaded = false;
        var asciimathLoaded = false;

        var ready = false;
        var onReadyCallback;

        /**
         * Checks if Katex has already been loaded, and if not, attaches a listener for when it has loaded.
         * 
         * Once it has loaded, calls through to onDependencyLoaded().
         */
        var checkKatex = function () {
            var onKatexLoaded = function() {
                console.log("[WeBWorK MathView] Katex loaded");
                katexLoaded = true;

                onDependencyLoaded();
            };

            // Check / attach listener for Katex being loaded
            if ("katex" in window) {
                onKatexLoaded();
            }
            else {
                document.getElementById(MV_SCRIPT_ID_KATEX).addEventListener("load", function() {
                    onKatexLoaded();
                });
            }
        };

        /**
         * Checks if ASCIIMath has already been loaded, and if not, attaches a listener for when it has loaded.
         * 
         * Once it has loaded, calls through to onDependencyLoaded().
         */
        var checkASCIIMath = function () {
            var onASCIIMathLoaded = function() {
                console.log("[WeBWorK MathView] ASCIIMath loaded");
                asciimathLoaded = true;

                onDependencyLoaded();
            };
            
            // Check / attach listener for ASCIIMath being loaded
            if ("AMTparseMath" in window) {
                onASCIIMathLoaded();
            }
            else
            {
                document.getElementById(MV_SCRIPT_ID_ASCIIMATH).addEventListener("load", function() {
                    onASCIIMathLoaded();
                });
            }
        };

        /**
         * Checks if all dependencies have been loaded. If they have calls through to onReady().
         */
        var onDependencyLoaded = function () {
            if (katexLoaded && asciimathLoaded) {
                onReady();
            }
        };

        /**
         * Handles the event that MathView is ready.
         */
        var onReady = function () {
            console.log("[WeBWorK MathView] ------------------------ READY ------------------------")
            ready = true;
            if (onReadyCallback) {
                onReadyCallback();
            }
        };

        /**
         * Sets the function that will be called when MathView is ready.
         * If MathView is already ready, this function will be invoked immediately.
         * @param {Function} callback the function to be called when MathView is ready
         */
        var setOnReadyListener = function (callback) {
            onReadyCallback = callback;
            if (ready) {
                onReady();
            }
        }

        /**
         * Starts a process to check / monitor for when dependencies have been loaded.
         * 
         * If a callback is registered through onMathViewReady it will be triggered eventually by this method,
         * once all the dependencies are loaded.
         */
        this.checkDependencies = function () {
            checkKatex();
            checkASCIIMath();
        };

        /**
         * Once MathView is loaded (the MathView script itself) and ready (all dependencies loaded), calls the provided callback
         */
        this.onMathViewReady = function (callback) {

            // Check if MathView has already been loaded, and if not, attaches a listener for when it has loaded.
            // Once it has loaded, call through to MathView.setOnReadyListener(...);
            if ("MathView" in window) {
                setOnReadyListener(callback);
            }
            else {
                document.getElementById(MV_SCRIPT_ID).addEventListener("load", function() {
                    setOnReadyListener(callback);
                });
            }
        }
    }

    // Start the dependency check process
    MathViewUtils.checkDependencies();
}