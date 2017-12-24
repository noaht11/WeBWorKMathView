var ExtConfig = new function () {

    var createRequestContentScript = function () {
        return new chrome.declarativeContent.RequestContentScript({
            "css": [
                "katex/katex.css",
                "math-view.css"
            ],
            "js": [
                "asciimath-based/ASCIIMathTeXImg.js",
                "katex/katex.min.js",
                "math-view.js",
                "extUtils.js",
                "content.js",
            ]
        })
    }

    /**
     * 
     * @param {boolean} autoDetectWW 
     * @param {string[]} wwDomains 
     * @param {boolean} enableWolfram 
     */
    var generateRules = function(autoDetectWW, wwDomains, enableWolfram) {

        var rules = [];

        if(autoDetectWW) {
            rules.push({
                id: "wwAutoDetect",
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { schemes: ["https", "http"] },
                    css: ["input.codeshard"]
                })],
                actions: [
                    createRequestContentScript()
                ]
            });
        }
        else {
            for(let i = 0; i < wwDomains.length; i++) {
                rules.push({
                    id: "wwDomain" + i,
                    conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostEquals: wwDomains[i], schemes: ["https", "http"] },
                    })],
                    actions: [
                        createRequestContentScript()
                    ]
                });
            }
        }

        if(enableWolfram) {
            rules.push({
                id: "wolfram",
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { hostEquals: "www.wolframalpha.com", schemes: ["https", "http"] },
                })],
                actions: [
                    createRequestContentScript() // TODO different content script
                ]
            });
        }

        return rules;
    }

};