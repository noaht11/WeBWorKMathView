console.log("[WeBWorK MathView] event-page.js");

var launchOptions = function () {
    chrome.tabs.create({ url: chrome.extension.getURL("options.html") }, function (tab) {
        console.log("[WeBWorK MathView] Launched Options Page");
    });
}

var handleUpdate1_1To1_2 = function () {
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

        if (previousVersion == "1.1" && currentVersion == "1.2") {
            handleUpdate1_1To1_2();
        }
    }
});