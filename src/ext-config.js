console.log("[WeBWorK MathView] ext-config.js");

var ExtConfig = new function () {

    var HOSTNAME_WOLFRAM_ALPHA = "www.wolframalpha.com";

    /**
     * @typedef {Object} ExtConfig.Storage.Data
     * @property {boolean} autoDetectWW
     * @property {string[]} wwHosts
     * @property {boolean} enableWolfram
     */

    this.Storage = new function () {

        /**
         * Constructor for an object to represent our stored data
         * 
         * @param {boolean} autoDetectWW if true, the scripts will automatically run on WeBWorK sites
         * @param {string[]} wwHosts a list of hosts (e.g. "webwork.university.ca") on which to run the scripts,
         *                             ignored if autoDetectWW is true
         * @param {boolean} enableWolfram if true, the scripts will run on WolframAlpha
         * 
         * @constructor
         */
        this.Data = function (autoDetectWW, wwHosts, enableWolfram) {
            this.autoDetectWW = autoDetectWW;
            this.wwHosts = wwHosts;
            this.enableWolfram = enableWolfram;
        }

        /**
         * Persists data in this extension's local storage
         * 
         * @param {ExtConfig.Storage.Data} data the data to persist
         * @param {setCallback} callback a function to call after the data is persisted
         */
        this.setData = function (data, callback) {
            chrome.storage.sync.set(data, callback);
        };

        /**
         * Retrieves data from this extension's local storage
         * @param {Function} callback a function to call with the retrieved data
         */
        this.getData = function (callback) {
            chrome.storage.sync.get(new this.Data(false, [], false), callback);
        };
    };

    this.Permissions = new function () {

        var PERMISSION_ALL_URLS = "<all_urls>";

        /**
         * Converts a hostname string into a URL pattern string representing all URLs with that hostname
         * @param {string} hostname the hostname
         */
        var getUrlPattern = function (hostname) {
            return "*://" + hostname + "/*";
        }

        var generatePermissions = function (data) {
            if (data.autoDetectWW) {
                return { origins: [PERMISSION_ALL_URLS] };
            }
            else {
                var urlPatterns = data.wwHosts.map(getUrlPattern);

                if (data.enableWolfram) {
                    urlPatterns.push(getUrlPattern(HOSTNAME_WOLFRAM_ALPHA));
                }

                return { origins: urlPatterns };
            }
        }

        /**
         * Requests extension permissions necessary for the provided configuration data
         * @param {ExtConfig.Storage.Data} data the configuration data
         * @param {Function} callback a function to call after the permission has been denied or granted.
         *                            Argument to the function indicates if the permissions were successfully updated
         */
        this.updatePermissions = function (data, callback) {
            // Generate new origins
            var newPermissions = generatePermissions(data);
            var newOrigins = newPermissions.origins;

            // Retrieve old origins
            chrome.permissions.getAll(function (oldPermissions) {
                var oldOrigins = oldPermissions.origins;

                // Compare new and old origins
                var originsToRemove = [];
                var originsToRequest = [];
                
                for(var i = 0; i < oldOrigins.length; i++) {
                    var origin = oldOrigins[i];
                    if(!newOrigins.includes(origin)) {
                        originsToRemove.push(origin);
                    }
                }

                for(var i = 0; i < newOrigins.length; i++) {
                    var origin = newOrigins[i];
                    if(!oldOrigins.includes(origin)) {
                        originsToRequest.push(origin);
                    }
                }

                // Remove old origins and add new origins if required

                console.log("Remove: ");
                console.log(originsToRemove);
                console.log("Request: ");
                console.log(originsToRequest);

                if (originsToRemove.length > 0) {
                    // Remove old permissions
                    chrome.permissions.remove({
                        origins: originsToRemove
                    }, function (removed) {
                        if (removed) {
                            // Old permissions removed
                            // Request new permissions
                            if (originsToRequest.length > 0) {
                                chrome.permissions.request({
                                    origins: originsToRequest
                                }, callback);
                            }
                            else {
                                // No permissions to add, remove was successful
                                callback(true);
                            }
                        }
                        else {
                            // Failed to remove permissions
                            callback(false);
                        }
                    });
                }
                else if (originsToRequest.length > 0) {
                    // No permissions to remove
                    // Request new permissions
                    chrome.permissions.request({
                        origins: originsToRequest
                    }, callback);
                }
                else {
                    // No permissions to remove or request
                    callback(true);
                }
            });
        };

    };

    this.Events = new function () {

        var CONTENT_WEBWORK_JS = "content-webwork.js";
        var CONTENT_WOLFRAM_JS = "content-wolfram.js";

        /**
         * Core CSS files that are not specific to the extension's operation on any particular domain
         */
        var CORE_CSS = [
        ];

        /**
         * Core JS files that are not specific to the extension's operation on any particular domain
         */
        var CORE_JS = [
            "math-view-utils.js",
            "math-view-ext.js"
        ];

        /**
         * Creates a RequestContentScript object containing the CSS and JS files required for operation
         * @param {string} contentJSFile the filename of the content script to use
         */
        var createRequestContentScript = function (contentJSFile) {
            var allJS = CORE_JS.slice();
            allJS.push(contentJSFile);

            return new chrome.declarativeContent.RequestContentScript({
                "css": CORE_CSS,
                "js": allJS
            });
        };

        /**
         * Generates a set of rules describing when to run our scripts based on the provided configuration data
         * @param {ExtConfig.Storage.Data} data the configuration data
         * @returns an array of JSON objects representing the onPageChanged rules to register based on
         * the provided arguments
         */
        var generateOnPageChangedRules = function (data) {
            var rules = [];

            if (data.autoDetectWW) {
                rules.push({
                    id: "wwAutoDetect",
                    conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { schemes: ["https", "http"] },
                        css: ["input.codeshard"]
                    })],
                    actions: [
                        createRequestContentScript(CONTENT_WEBWORK_JS)
                    ]
                });
            }
            else {
                for (let i = 0; i < data.wwHosts.length; i++) {
                    rules.push({
                        id: "wwDomain" + i,
                        conditions: [new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: { hostEquals: data.wwHosts[i], schemes: ["https", "http"] },
                        })],
                        actions: [
                            createRequestContentScript(CONTENT_WEBWORK_JS)
                        ]
                    });
                }
            }

            if (data.enableWolfram) {
                rules.push({
                    id: "wolfram",
                    conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostEquals: HOSTNAME_WOLFRAM_ALPHA, schemes: ["https", "http"] },
                    })],
                    actions: [
                        createRequestContentScript(CONTENT_WOLFRAM_JS)
                    ]
                });
            }

            return rules;
        };

        /**
         * Registers rules for the onPageChanged event to trigger our scripts according to the provided configuration data
         * @param {ExtConfig.Storage.Data} data the configuration data
         */
        this.registerOnPageChangedRules = function (data) {
            var newRules = generateOnPageChangedRules(data);

            chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
                chrome.declarativeContent.onPageChanged.addRules(newRules);
            });
        };

    };

};