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