# WeBWorKLivePreview
A Chrome extension to provide live previews of math equations entered into WeBWorK text fields using MathJax

![Screenshot](/docs/Screenshot.png?raw=true)

# Installation
1. Download the ```WeBWorKLivePreview.crx``` file
2. Go to the Extensions Page in Chrome (Menu Button > More tools > Extensions or ```chrome://extensions/```)
3. Drag and drop the downloaded file onto the Extensions page
4. Click "Add Extension" when prompted

# How it Works
When a webwork page loads, the extension inserts ```<div>``` elements next to all input fields that have the class "codeshard"
(this seems to be the identifying characteristic of an answer field).

It then listens for any keyup events from those input fields and updates the text of the adjacent ```<div>``` element's text with the following:
```
`<input field text>`
```

Then it makes a request to MathJax (which is what WeBWorK already uses to display equations) to typeset the ```<div>``` elements
(the reason we surround the input field text in backticks is so that MathJax recognizes it as AsciiMath that needs to be typeset).

To avoid flashes when the text is being updated, there are actually two ```<div>```s for each input field.
When one is being updated, it is hidden, then once it is finished being updated, it gets displayed
and the other ```<div>``` is hidden and updated.

# Notes
The extension is currently configured to only run on ```https://webwork.elearning.ubc.ca/*``` webpages (although this can be easily modified).

# License
Apache License, Version 2.0
```
   Copyright 2017 Noah Tajwar

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```
