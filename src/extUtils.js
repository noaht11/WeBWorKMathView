/**
 * Injects the provided function into the current webpage inside of a <script> tag in the <head> element
 * @param {Function} func the function to inject
 */
function injectScript(func) {
    var actualCode = '(' + func + ')();'
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
}