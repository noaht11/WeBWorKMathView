console.log("[WeBWorK MathView] event-page.js");

var launchOptions = function () {
    chrome.tabs.create({ url: chrome.extension.getURL("options.html") }, function (tab) {
        console.log("[WeBWorK MathView] Launched Options Page");
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
            // 2 -> 3 Update
            chrome.storage.sync.get({
                webworkHostname: ""
            },
            function (items) {
                var contentText = document.getElementById("currentDataContentText");
                if (items.webworkHostname.length > 0) {
                    // Existing WeBWorK URL so migrate to new system

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
                                // Permission denied :( Show an error
                                launchOptions();
                            }
                        });
                    });
                }
                else {
                    // No WeBWorK URL set so launch the options page
                    launchOptions();
                }
            });
        }
    }
});