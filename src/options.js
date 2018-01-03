console.log("Before rules");

//var rules = ExtConfig.generateRules(false, ["webwork.elearning.ubc.ca"], false);

ExtConfig.Storage.setData(new ExtConfig.Storage.Data(false, ["webwork.elearning.ubc.ca"], false), function () {
    console.log("Saved");
});

//console.log(rules);

//registerRules(rules);

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

function saveData() {
    save_options();
}

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

        ExtConfig.Permissions.updatePermissions(data, function(granted) {
            console.log("Permissions done");
            console.log(granted);

            if(granted) {
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

document.getElementById("test").addEventListener("click", allURLsPermission);

document.getElementById("editButton").addEventListener("click", editData);
document.getElementById("saveButton").addEventListener("click", saveData);

document.addEventListener("DOMContentLoaded", restore_options);