function getSynchronizerToken() {
    return $("#synchronizer-token-div").text();
}
function getGoogleLoginURL(onSuccess, onFailure) {
    $.get('/oauth-client-config', function (responseConfig) {
        if (responseConfig.google) {
            var queryString = $.param({
                "client_id": responseConfig.google.clientId,
                "redirect_uri": responseConfig.google.redirectUri,
                "response_type": "code",
                "scope": "openid profile",
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
