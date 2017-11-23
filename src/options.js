// Saves options to chrome.storage
function save_options() {
    var url = document.getElementById("urlIn").value;

    var status = document.getElementById("status");

    // Permissions must be requested from inside a user gesture, like a button's
    // click handler.
    chrome.permissions.request({
        origins: [url + "/*"]
    }, function (granted) {
        // The callback argument will be true if the user granted the permissions.
        if (granted) {
            chrome.storage.sync.set(
                {
                    webworkHostname: new URL(url).hostname
                },
                function () {
                    // Update status to let user know options were saved.
                    status.textContent = "Options saved.";
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
            document.getElementById("urlIn").value = items.webworkHostname;
        });
}

document.getElementById("save").addEventListener("click", save_options);
document.addEventListener("DOMContentLoaded", restore_options);