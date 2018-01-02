/**
 * Injects the provided function into the current webpage inside of a <script> tag in the <head> element
 * @param {Function} func the function to inject
 */
var injectScript = function (func) {
    var actualCode = '(' + func + ')();'
    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
}

/**
 * Registers a set of rules for the onPageChanged event
 * @param {[]} rules an array of the rules to register
 */
var registerRules = function (rules) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules(rules);
    });
} 