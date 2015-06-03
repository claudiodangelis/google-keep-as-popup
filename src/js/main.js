// Google Analytics tracking code
//var _gaq = _gaq || [];
//_gaq.push(['_setAccount', 'UA-60445871-1']);
//_gaq.push(['_trackPageview']);
//(function() {
//  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//  ga.src = 'https://ssl.google-analytics.com/ga.js';
//  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
//})();
/* Top level objects */
var GOOGLE_ACCOUNT_URL = "https://accounts.google.com/ServiceLogin";
// iframe that will wrap Keep
var keepView = document.querySelector("#keep-view");
// Spinner
var spinnerView = document.querySelector("#spinner-view");
// Not auth
var notAuthView = document.querySelector("#notAuth-view");
// Toolbar
var toolbar = document.querySelector("div#toolbar");
// Detach button
var buttonDetach = document.querySelector("span#btn-detach");
// Views
var views = [keepView, spinnerView, notAuthView];
showView(spinnerView);
// We handle the frame here
// When it's loaded:
keepView.onload = function () {
    // Hide the spinnerView
    showView(keepView);
    toolbar.style.visibility = "visible";
    toolbar.style.display = "block";
};
keepView.width = 500;
keepView.height = 500;
keepView.src = "https://keep.google.com/keep";
buttonDetach.addEventListener("click", function (e) {
    var left = e.clientX + e.view.screenLeft - 250;
    var top = e.screenY - 10;
    chrome.windows.create({
        url: "https://keep.google.com/keep",
        width: 500,
        height: 500,
        left: left,
        top: top,
        focused: true,
        type: "popup"
    });
});
// We use this to prevent the "Refused to display document because display
// forbidden by X-Frame-Options" issue
chrome.webRequest.onHeadersReceived.addListener(
    function(req) {
        var headers = req.responseHeaders;
        var toRemove = false;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == "location" && headers[i].value.indexOf(GOOGLE_ACCOUNT_URL) == 0) {
                // Removing the iframe
                keepView.remove();
                // Showing the not-auth view
                showView(notAuthView);
                // Canceling the request
                return {cancel: true};
            }
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1);
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ '*://*/*' ],
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);
// Bind the login button
document.querySelector("#login-btn").onclick = function (e) {
    chrome.tabs.create({url: GOOGLE_ACCOUNT_URL});
};
function showView(view) {
    for (var i = 0; i < views.length; i++) {
        if (view == views[i]) {
            views[i].style.visibility = "visible";
            views[i].style.display = "block";
        } else {
            views[i].style.visibility = "hidden";
            views[i].style.display = "none";
        }
    }
}

