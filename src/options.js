// Saves options to chrome.storage
function save_options() {
    var status = document.getElementById("status");
    var urlString = document.getElementById("urlIn").value;

    var url;
    try {
        url = new URL(urlString);
    }
    catch (err) {
        console.log(err);
        status.textContent = "Invalid URL";
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
                    // Update status to let user know options were saved.
                    registerRules();
                    status.textContent = "Options saved.";
                    document.getElementById("currentDataContentText").textContent = hostname;
                    saveSuccess();
                    setTimeout(function () {
                        status.textContent = "";
                    }, 750);
                });
        } else {
            status.textContent = "You must grant the permission";
        }
    });
}

function restore_options() {
    chrome.storage.sync.get(
        {
            webworkHostname: ""
        },
        function (items) {
            document.getElementById("currentDataContentText").textContent = items.webworkHostname;
        });
}

function editData() {
    document.getElementById("currentDataContentText").style.display = "none";
    var inputField = document.getElementById("dataInputField");
    document.getElementById("dataInputField").style.display = "block";

    document.getElementById("editButton").style.display = "none";
    document.getElementById("saveButton").style.display = "block";

    document.getElementById("urlIn").focus();
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

document.getElementById("editButton").addEventListener("click", editData);
document.getElementById("saveButton").addEventListener("click", saveData);

document.addEventListener("DOMContentLoaded", restore_options);