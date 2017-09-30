function getSynchronizerToken(): string
{
	return $("#synchronizer-token-div").text();
}

function getGoogleLoginURL(onSuccess: (url: string) => void, onFailure: () => void)
{
    // STUB: need to handle get request errors.
    $.get('/oauth-client-config', function(responseConfig)
    {
		if(responseConfig.google)
		{
            let queryString = $.param({
                "client_id": responseConfig.google.clientId,
                "redirect_uri": responseConfig.google.redirectUri,
                "response_type": "code",
                "scope": "openid profile",
                "state": getSynchronizerToken()
            })
            onSuccess(`${responseConfig.google.authUri}?${queryString}`);
        }
        else
        {
            onFailure();
        }
	});
}

function main()
{
    getGoogleLoginURL((url) => $(".landing-main-google-signin").click(() => window.location.href = url),
                        () => alert('Error: failed to get Google login information.'));
}

$(document).ready(() => main());