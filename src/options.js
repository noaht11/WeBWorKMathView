ExtConfig.Storage.setData(new ExtConfig.Storage.Data(false, ["webwork.elearning.ubc.ca"], false), function () {
    //console.log("Saved");
});

/**
 * Handles click events on the checkbox button
 * @param {Event} event the click event
 */
function toggleAutoDetect(event) {
    var checkbox = document.getElementById("autoDetect");
    if (event.target.id != "autoDetect") {
        event.preventDefault(); // Stops the event from firing twice
        checkbox.checked = !checkbox.checked;
    }

    saveData();
}

function loadData() {
    ExtConfig.Storage.getData(function (data) {
        if (data.autoDetectWW) {
            document.getElementById("autoDetect").checked = true;
            disableManual();
        }

        var wwHostInputs = getWWHostInputs();
        for (var i = 0; i < wwHostInputs.length; i++) {
            var theHost = data.wwHosts[i];
            if (theHost) {
                wwHostInputs[i].value = theHost;
            }
        }
    });
}

function saveData() {
    var data = collectData();
    ExtConfig.Storage.setData(data, function () {
        console.log(data);
        loadData();
    });
}

function collectData() {
    var autoDetectWW = document.getElementById("autoDetect").checked;
    var enableWolfram = false;
    var wwHosts = [];

    var wwHostInputs = getWWHostInputs();
    for (var i = 0; i < wwHostInputs.length; i++) {
        var inputText = wwHostInputs[i].value;
        var theWWHost = extractHostname(inputText);
        if (theWWHost) {
            wwHosts.push(theWWHost);
        }
    }

    return new ExtConfig.Storage.Data(autoDetectWW, wwHosts, enableWolfram);
}

/**
 * Extracts the hostname from a piece of text that either contains just a hostname or a full URL
 * @param {string} text the text from which to extract the hostname
 */
function extractHostname(text) {
    var validHostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

    if (text) {
        text = text.trim();
    }

    if (text) {
        if (validHostnameRegex.test(text)) {
            return text;
        }
        else {
            try {
                var url = new URL(text);
                return url.hostname;
            }
            catch (err) {
                return null;
            }
        }
    }
    return null;
}

function validateWWHostInputs() {
    var wwHostInputs = getWWHostInputs();
    for (var i = 0; i < wwHostInputs.length; i++) {
        var theWWHost = wwHostInputs[i].value;

        if (theWWHost) {
            var url;
            try {
                url = new URL(theWWHost);
            }
            catch (err) {

            }
        }
    }
}

function getWWHostInputs() {
    var wwHostInputs = [];
    for (var i = 0; i < 3; i++) {
        wwHostInputs.push(document.getElementById("wwHostInput" + i));
    }
    return wwHostInputs;
}

function disableManual() {
    // TODO 
}

// Saves options to chrome.storage
function save_options() {
    var status = document.getElementById("status");
    var urlString = document.getElementById("urlIn").value;

    var errorColor = "#ff0000";
    var successColor = "#00bb44";

    var url;
    try {
        url = new URL(urlString);
    }
    catch (err) {
        console.log(err);
        status.textContent = "Invalid URL";
        status.style.color = errorColor;
        return;
    }

    var hostname = url.hostname;
    var permissionTarget = "*://" + hostname + "/*";

    // Permissions must be requested from inside a user gesture, like a button's
    // click handler.
    chrome.permissions.request({
        origins: [permissionTarget]
    }, function (granted) {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
            chrome.storage.sync.set(
                {
                    webworkHostname: hostname
                },
                function () {
                    // Listen for events on the new hostname
                    registerRules();

                    // Update status to let user know options were saved.
                    status.textContent = "Saved";
                    status.style.color = successColor;

                    // Update the view mode
                    restore_options();
                    saveSuccess();

                    // Remove the status message after a short delay
                    setTimeout(function () {
                        status.textContent = "";
                    }, 750);
                });
        } else {
            status.textContent = "You must click \"Allow\" on the permission popup";
            status.style.color = errorColor;
        }
    });
}

function restore_options() {
    chrome.storage.sync.get(
        {
            webworkHostname: ""
        },
        function (items) {
            var contentText = document.getElementById("currentDataContentText");
            if (items.webworkHostname.length > 0) {
                contentText.textContent = items.webworkHostname;
                console.log(items.webworkHostname);
                document.getElementById("urlIn").value = ("https://" + items.webworkHostname);
                contentText.style.color = "#ffffff";
            }
            else {
                contentText.textContent = "Not Set";
                contentText.style.color = "#b6b6b6";
            }
        });
}

function editData() {
    document.getElementById("currentDataContentText").style.display = "none";
    var inputField = document.getElementById("dataInputField");
    inputField.style.display = "block";

    document.getElementById("editButton").style.display = "none";
    document.getElementById("saveButton").style.display = "block";

    var urlIn = document.getElementById("urlIn");
    urlIn.focus();
    urlIn.select();
}

/*function saveData() {
    save_options();
}*/

function saveSuccess() {
    document.getElementById("currentDataContentText").style.display = "block";
    var inputField = document.getElementById("dataInputField");
    document.getElementById("dataInputField").style.display = "none";

    document.getElementById("editButton").style.display = "block";
    document.getElementById("saveButton").style.display = "none";
}

function allURLsPermission() {

    console.log("Permission click");

    ExtConfig.Storage.getData(function (data) {
        console.log("Loaded");
        console.log(data);

        ExtConfig.Permissions.updatePermissions(data, function (granted) {
            console.log("Permissions done");
            console.log(granted);

            if (granted) {
                ExtConfig.Events.registerOnPageChangedRules(data);
            }
        })
    });

    /*chrome.permissions.request({
        origins: ["<all_urls>"]
    }, function (granted) {
        console.log("granted");
    });*/
}

document.getElementById("autoDetectContainer").addEventListener("click", toggleAutoDetect);
document.getElementById("saveButton").addEventListener("click", saveData);

//document.getElementById("editButton").addEventListener("click", editData);
//document.getElementById("saveButton").addEventListener("click", saveData);

document.addEventListener("DOMContentLoaded", loadData);