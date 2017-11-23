# WeBWorKLivePreview
A Chrome extension to provide live previews of math equations entered into WeBWorK text fields using KaTeX, MathJax and AsciiMath

![Screenshot](/docs/Screenshot.png?raw=true)

# Installation
1. Download the ```WeBWorKLivePreview.crx``` file (in the build folder)
2. Go to the Extensions Page in Chrome (Menu Button > More tools > Extensions or ```chrome://extensions/```)
3. Drag and drop the downloaded file onto the Extensions page
4. Click "Add Extension" when prompted (there may be a 2-3 second delay before the prompt appears)

# Libraries
This extension makes use of the following open source libraries:
 * [KaTeX](https://khan.github.io/KaTeX/)
 * [MathJax](https://www.mathjax.org/)
   * The WeBWorK platform already uses MathJax to render its own equations, so this extension uses WeBWorK's
     instance of MathJax
 * [AsciiMath](http://asciimath.org/)
   * This extension uses a modified version of the ASCIIMathTeXImg.js file that returns a LaTeX string for a given AsciiMath input

# How it Works
**Loading a webpage**

When a webpage matching the predefined URL pattern loads, the extension performs the following:
* Injects a ```<script>``` tag containing a callback for onkeyup events in the page's text inputs
* Inserts ```<div>``` elements next to each input with the class ```"codeshard"```
* Assigns attributes to the ```"codeshard"``` inputs to uniquely identify them within the page (an index number)
* Attaches ```onkeyup``` evens to the ```"codeshard"``` inputs to call the previously injected callback
* Writes ```<script>``` tags into the webpage to load the LaTeX and AsciiMath javascript files (that are pacakged with the extension).

**The onkeyup callback**
1. The current contents of the input field that triggered the event are placed into the associated injected ```<div>```
2. The modified AMparseMath(str) function from AsciiMath is used to translate the input text into LaTeX
3. An attempt is made to render the LaTeX using KaTeX
4. Since KaTeX does not support as many function, if KaTeX throws an error, MathJax is used to typeset the raw AsciiMath (NOTE: for this to work, the AsciiMath must be surrounded by backticks);

NOTE: When using MathJax, since it is much slower, there are actually two ```<div>```s for each input field, to avoid flashes when the text is being updated.
When one ```<div>``` is being updated, it is hidden, then once it is finished being updated, it gets displayed
and the other ```<div>``` is hidden and updated.

# Notes
The extension is currently configured to only run on ```https://webwork.elearning.ubc.ca/*``` webpages (although this can be easily modified).

# License
MIT License
```
Copyright 2017 Noah Tajwar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
