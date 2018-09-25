console.log("[WeBWorK MathView] event-page.js");

/**************** TEMP */
function registerRules() {
    chrome.storage.sync.get(
        {
            webworkHostname: ""
        },
        function (items) {
            if (items.webworkHostname.length > 0) {
                var webworkRule = {
                    id: "webworkRule",
                    conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostEquals: items.webworkHostname, schemes: ["https", "http"] },
                    })],
                    actions: [
                        new chrome.declarativeContent.RequestContentScript({
                            "css": [
                                "katex/katex.css"
                            ],
                            "js": [
                                "asciimath-based/ASCIIMathTeXImg.js",
                                "katex/katex.min.js",
                                "content.js"
                            ]
                        })
                    ]
                };

                chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
                    chrome.declarativeContent.onPageChanged.addRules([webworkRule]);
                });
            }
        });
}

function save_options() {
    var urlString = "https://webwork.elearning.ubc.ca/webwork2/2018W1_ELEC221/Problem_Set_2/4/?effectiveUser=BLA9YQ6E5S08&user=BLA9YQ6E5S08&key=Siz8zomGWOQETV2vgEpdq9obSVZPtUmh";

    var url;
    try {
        url = new URL(urlString);
    }
    catch (err) {
        console.log(err);
        return;
    }

    var hostname = url.hostname;
    var permissionTarget = "*://" + hostname + "/*";

    // Permissions must be requested from inside a user gesture, like a button's
    // click handler.
    // chrome.permissions.request({
    //     origins: [permissionTarget]
    // }, function (granted) {
    //     // The callback argument will be true if the user granted the permissions.
    //     if (granted) {
            chrome.storage.sync.set(
                {
                    webworkHostname: hostname
                },
                function () {
                    // Listen for events on the new hostname
                    registerRules();
                });
    //     } else {
    //         console.log("You must click \"Allow\" on the permission popup");
    //     }
    // });
}

/**************** END TEMP */


var launchOptions = function () {
    chrome.tabs.create({ url: chrome.extension.getURL("options.html") }, function (tab) {
        console.log("[WeBWorK MathView] Launched Options Page");
    });
}

var handleUpdate2To3 = function () {
    // Main Changes:
    //   - New system for storing the webwork domain
    //   - Addition of automatic detection of webwork sites
    //
    // Migration strategy:
    //   - If an existing webwork domain has been registered, retrieve that
    //   - Attempt to store it as a manually entered domain (this way we don't need to ask for new permissions)
    //   - If no existing webwork domains are registered, launch the options page so users can see the new options

    // Fetch the currently stored webwork domain
    chrome.storage.sync.get({
        webworkHostname: ""
    },
    function (items) {
        // Check if a webwork domain was successfully retrieved
        if (items.webworkHostname.length > 0) {
            // Existing WeBWorK URL found, so migrate to new system

            // Retrieve the current data
            ExtConfig.Storage.getData(function (data) {
                // Add the hostname we want permission for
                data.wwHosts.push(items.webworkHostname);
                // Request the new permissions
                ExtConfig.Permissions.updatePermissions(data, function (granted) {
                    if(granted) {
                        // Permission granted! Register rules and save the data
                        ExtConfig.Events.registerOnPageChangedRules(data);
                        ExtConfig.Storage.setData(data, function () {
                            console.log("[WeBWorK MathView] Successfully migrated existing WeBWorK URL");
                        });
                    }
                    else {
                        // Permission denied :( launch the options page
                        launchOptions();
                    }
                });
            });
        }
        else {
            // No WeBWorK URL set so launch the options page
            //launchOptions();
        }
    });
}

chrome.runtime.onInstalled.addListener(function (object) {
    if (chrome.runtime.OnInstalledReason.INSTALL === object.reason) {
        launchOptions();
    }
    else if (chrome.runtime.OnInstalledReason.UPDATE === object.reason) {
        var currentVersion = chrome.runtime.getManifest().version;
        var previousVersion = object.previousVersion;

        if (previousVersion == 2 && currentVersion == 3) {
            handleUpdate2To3();
        }
    }
});