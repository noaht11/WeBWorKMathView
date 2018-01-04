/**
 * Handles click events on the checkbox button
 * @param {Event} event the click event
 */
function toggleAutoDetect(event) {
    var checkbox = document.getElementById("autoDetect");

    var pendingChecked = checkbox.checked;

    // We don't want to visibly toggle state yet
    if (event.target.id != "autoDetect") {
        event.preventDefault(); // Stops the event from firing twice
        pendingChecked = !pendingChecked;
        // Do nothing
    } else {
        // Undo the check the automatically happened
        checkbox.checked = !pendingChecked;
    }

    ExtConfig.Storage.getData(function (data) {
        data.autoDetectWW = pendingChecked;

        ExtConfig.Permissions.updatePermissions(data, function (granted) {
            var permissionsMsg = document.getElementById("autoDetectPermissionMsg");

            if(granted) {
                checkbox.checked = pendingChecked;
                ExtConfig.Events.registerOnPageChangedRules(data);
                saveData(data);
                
                permissionsMsg.style.display = "none";
            }
            else {
                permissionsMsg.style.display = "block";
            }
        });
    });
}

function loadData() {
    ExtConfig.Storage.getData(function (data) {
        document.getElementById("autoDetect").checked = data.autoDetectWW;
        if (data.autoDetectWW) {
            disableManual();
        } else {
            enableManual();
        }

        // Clear all current ww host elements
        var wwHostsContainer = document.getElementById("wwHosts");
        while(wwHostsContainer.firstChild) {
            wwHostsContainer.removeChild(wwHostsContainer.firstChild);
        }

        // Add elements for all the hosts
        for (var j = 0; j < data.wwHosts.length; j++) {
            var theHost = data.wwHosts[j];
            addWWHostElement(theHost);
        }
    });
}

function disableManual() {
    document.getElementById("manual").className = "manualDisabled";
    var addButton = document.getElementById("addButton");
    addButton.disabled = true;
    addButton.title = "You have to disable Auto-Detect to manually add WeBWorK sites";
}

function enableManual() {
    document.getElementById("manual").className = "";
    var addButton = document.getElementById("addButton");
    addButton.disabled = false;
    addButton.title = "";
}

function saveData(data) {
    ExtConfig.Storage.setData(data, function () {
        loadData();
    });
}

/*function collectData() {
    var autoDetectWW = document.getElementById("autoDetect").checked;
    var enableWolfram = false;
    var wwHosts = [];

    var wwHostElements = getWWHostElements();
    for (var i = 0; i < wwHostElements.length; i++) {
        var wwHost = wwHostElements[i].textContent;
        wwHosts.push(wwHost);
    }

    return new ExtConfig.Storage.Data(autoDetectWW, wwHosts, enableWolfram);
}*/

function getWWHostElements() {
    return document.getElementsByClassName("wwHostText");
}

function addWWHostElement(text) {
    var container = document.createElement("div");
    container.className = "wwHost";

    var textElement = document.createElement("div");
    textElement.className = "wwHostText";
    textElement.textContent = text;

    var deleteButton = document.createElement("div");
    deleteButton.className = "deleteButton";
    deleteButton.innerHTML = "&times;";
    deleteButton.addEventListener("click", function (event) {
        document.getElementById("wwHosts").removeChild(this.parentNode);

        ExtConfig.Storage.getData(function (data) {
            data.wwHosts.splice(data.wwHosts.indexOf(text), 1);
            
            ExtConfig.Permissions.updatePermissions(data, function (granted) {
                ExtConfig.Events.registerOnPageChangedRules(data);

                saveData(data);
            });
        });
    });

    container.appendChild(textElement);
    container.appendChild(deleteButton);

    var parent = document.getElementById("wwHosts");
    parent.appendChild(container);
}

function showWWHostInputDialog() {
    document.getElementById("wwHostInputDialog").style.display = "block";
    document.getElementById("wwHostInputField").focus();
}

function hideWWHostInputDialog() {
    document.getElementById("wwHostInputDialog").style.display = "none";
    document.getElementById("wwHostInputField").value = "";
    document.getElementById("wwHostInputMsg").textContent = "";
}

function validateWWHost() {
    var text = document.getElementById("wwHostInputField").value;
    var hostname = extractHostname(text);

    var msgElement = document.getElementById("wwHostInputMsg");

    if(hostname) {
        // Retrieve the current data
        ExtConfig.Storage.getData(function (data) {
            // Add the hostname we want permission for
            data.wwHosts.push(hostname);
            // Request the new permissions
            ExtConfig.Permissions.updatePermissions(data, function (granted) {
                if(granted) {
                    // Permission granted! Register rules and save the data
                    ExtConfig.Events.registerOnPageChangedRules(data);
                    saveData(data);
                    hideWWHostInputDialog(); 
                }
                else {
                    // Permission denied :( Show an error
                    msgElement.textContent = "You must grant the permission to use the extension on this WeBWorK site";
                }
            });
        });
    }
    else {
        msgElement.textContent = "Invalid URL / Hostname";
    }
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

function handleWWHostInputKeyup(event) {
    if(event.keyCode == 13) {
        validateWWHost();
    }
}

document.getElementById("autoDetectContainer").addEventListener("click", toggleAutoDetect);

document.getElementById("addButton").addEventListener("click", showWWHostInputDialog);
document.getElementById("wwHostInputClose").addEventListener("click", hideWWHostInputDialog);
document.getElementById("wwHostInputField").addEventListener("keyup", handleWWHostInputKeyup);
document.getElementById("wwHostInputSave").addEventListener("click", validateWWHost);

document.addEventListener("DOMContentLoaded", loadData);