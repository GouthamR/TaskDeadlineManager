(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function getSynchronizerToken() {
    return $("#synchronizer-token-div").text();
}
function getGoogleLoginURL(onSuccess, onFailure) {
    // STUB: need to handle get request errors.
    $.get('/oauth-client-config', function (responseConfig) {
        if (responseConfig.google) {
            var queryString = $.param({
                "client_id": responseConfig.google.clientId,
                "redirect_uri": responseConfig.google.redirectUri,
                "response_type": "code",
                "scope": "https://www.googleapis.com/auth/userinfo.email",
                "state": getSynchronizerToken()
            });
            onSuccess(responseConfig.google.authUri + "?" + queryString);
        }
        else {
            onFailure();
        }
    });
}
function main() {
    getGoogleLoginURL(function (url) { return $(".landing-main-google-signin").click(function () { return window.location.href = url; }); }, function () { return alert('Error: failed to get Google login information.'); });
}
$(document).ready(function () { return main(); });

},{}]},{},[1]);
