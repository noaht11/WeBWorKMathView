console.log("[WeBWorK MathView] event-page.js");

var launchOptions = function () {
    chrome.tabs.create({ url: chrome.extension.getURL("options.html") }, function (tab) {
        console.log("[WeBWorK MathView] Launched Options Page");
    });
};

var migrateHostname = function () {
    // Migration strategy:
    //   - If an existing webwork domain has been registered, retrieve that
    //   - Attempt to store it as a manually entered domain (this way we don't need to ask for new permissions)
    //   - If no existing webwork domains are registered, launch the options page so users can see the new options

    console.log("[WeBWorK MathView] Migrating Hostname...");

    // Fetch the currently stored webwork domain
    chrome.storage.sync.get({
        webworkHostname: ""
    },
    function (items) {
        // Check if a webwork domain was successfully retrieved
        if (items.webworkHostname.length > 0) {
            // Existing WeBWorK domain found, see if we've already dealt with it

            // Retrieve the current data
            ExtConfig.Storage.getData(function (data) {
                if (!data.wwHosts.includes(items.webworkHostname)) {
                    // The WeBWorK domain has not been dealt with yet
                    data.wwHosts.push(items.webworkHostname);
                    // Request the new permissions (note if this permission wasn't already granted, this request will fail
                    // since a permission request can only be triggered by a user action)
                    ExtConfig.Permissions.updatePermissions(data, function (success) {
                        if(success) {
                            // Permission was already granted! Register rules and save the data
                            ExtConfig.Events.registerOnPageChangedRules(data);
                            ExtConfig.Storage.setData(data, function () {
                                console.log("[WeBWorK MathView] Migration successful for: " + items.webworkHostname);
                            });
                        }
                        else {
                            console.log("[WeBWorK MathView] Permission not granted for existing WeBWorK domain");
                        }
                    });
                }
                else {
                    console.log("[WeBWorK MathView] Existing WeBWorK domain already migrated");
                }
            });

            // Remove the existing webworkHostname (regardless of if we were successful in transferring)
            ExtConfig.Storage.delete(["webworkHostname"], function () {
                console.log("[WeBWorK MathView] Deleted old webworkHostname key");
            });
        }
        else {
            console.log("[WeBWorK MathView] No existing WeBWorK domain");
        }
    });
};

var handleVersions = function(previous, current) {
    // version 1.0 was the original system where a single hostname was stored
    // version 1.1 and 1.2 were updates that weren't done correctly so still need to be fixed
    if (previous == "1.0" || previous == "1.1" || previous == "1.2") {
        migrateHostname();
    }
};

chrome.runtime.onInstalled.addListener(function (object) {
    if (chrome.runtime.OnInstalledReason.INSTALL === object.reason) {
        launchOptions();
    }
    else if (chrome.runtime.OnInstalledReason.UPDATE === object.reason) {
        var currentVersion = chrome.runtime.getManifest().version;
        var previousVersion = object.previousVersion;
        handleVersions(previousVersion, currentVersion);
    }
});