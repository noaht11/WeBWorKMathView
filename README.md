# WeBWorK MathView
A Chrome extension to provide live previews of math equations entered into WeBWorK text fields using KaTeX, MathJax and AsciiMath.

[WeBWorK MathView on the Chrome Web Store](https://chrome.google.com/webstore/detail/webwork-mathview/jcphgophoinpfmbnfecgekaeaoocbogd?hl=en)

![Screenshot](/img/Demo.gif?raw=true)

# Installation
1. Clone the repository
2. Go to the Extensions Page in Chrome (Menu Button > More tools > Extensions or enter ```chrome://extensions/``` in the URL bar)
3. Click "Load unpacked" in the top-left corner
4. Select the ```src``` folder of the repository
5. The extension settings page will automatically launch so you can enable / configure it

# Libraries
This extension makes use of the following open source libraries:
 * [KaTeX](https://khan.github.io/KaTeX/)
 * [MathJax](https://www.mathjax.org/)
   * The WeBWorK platform already uses MathJax to render its own equations, so this extension uses WeBWorK's
     instance of MathJax
 * [AsciiMath](http://asciimath.org/)
   * This extension uses a modified version of the ASCIIMathTeXImg.js file that returns a LaTeX string for a given AsciiMath input

# How it Works
**Auto-Detect vs. Manual Domain Entry**

There are two modes of operation to give users the options of granting fewer permissions to the extension.

If Auto-Detect is enabled, the extension will execute its content script when the current page contains inputs with the class ```codeshard```. To detect this, the extension has to request the ```<all urls>``` permission.

Alternatively, the user can manually enter the domain of their WeBWorK site and the extension will only execute its content script on those domains. In this case, the extension only has to request permissions for that particular domain.

**Loading a webpage**

When the content script executes, it does the following:
* Injects a ```<script>``` tag containing a callback for onkeyup events in the page's text inputs
* Inserts ```<div>``` elements next to each input with the class ```"codeshard"```
* Assigns attributes to the ```"codeshard"``` inputs to uniquely identify them within the page (an index number)
* Attaches ```onkeyup``` evens to the ```"codeshard"``` inputs to call the previously injected callback
* Writes ```<script>``` tags into the webpage to load the LaTeX and AsciiMath javascript files (that are pacakged with the extension).

**The onkeyup callback**
1. The current contents of the input field that triggered the event are placed into the associated injected ```<div>```
2. The modified AMparseMath(str) function from AsciiMath is used to translate the input text into LaTeX
3. An attempt is made to render the LaTeX using KaTeX
4. Since KaTeX does not support as many functions, if KaTeX throws an error, MathJax is used to typeset the raw AsciiMath (NOTE: for this to work, the AsciiMath must be surrounded by backticks);

NOTE: When using MathJax, since it is much slower, there are actually two ```<div>```s for each input field, to avoid flashes when the text is being updated.
When one ```<div>``` is being updated, it is hidden, then once it is finished being updated, it gets displayed
and the other ```<div>``` is hidden and updated.

# License

See [LICENSE](LICENSE)
