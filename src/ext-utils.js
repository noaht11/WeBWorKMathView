/************* FILE NOT USED ****************/

console.log("[WeBWorK MathView] ext-utils.js");

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
 * Injects the provided function into the current webpage inside of a <script> tag in the <head> element
 * @param {Function} func the function to inject
 */
var injectInlineScript = function (func) {
    var actualCode = "(" + func + ")();";
    injectInlineScriptText(actualCode);
};

/**
 * Injects a script element into the <head> tag with a src attribute pointing to a remote script
 * @param {string} path the full path to the remote script to be injected
 */
var injectRemoteScript = function (path) {
    var script = document.createElement("script");
    script.src = path;
    script.defer = "defer";
    (document.head || document.documentElement).appendChild(script);
}
