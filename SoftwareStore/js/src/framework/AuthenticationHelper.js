/**
 * Authentication Manager. Used to handle authentication
 */
(function () {
    "use strict";

    var USER_CANCELLED = "user_cancel";

    /**
     * Parse the redirect_uri to extract the values from the fragment
     */
    function parseTokenResponse(uri) {
        var u = Windows.Foundation.Uri(uri);
        // Replace # with ? because WwwFormUrlDecoder works with query strings ("?")
        var qs = "?" + u.fragment.substring(1);
        var decoder = new Windows.Foundation.WwwFormUrlDecoder(qs);

        var response;

        // Either token and exp_time or error and err_description are returned.
        // Win8 decoder fails if a param is not found, so we try to get the token, if it fails we try to get the error
        // If that fails too, something really wrong happened (we return a generic error message)
        try {
            response = {
                token: decoder.getFirstValueByName("access_token"),
                expirationTime: decoder.getFirstValueByName("expires_in")
            }
        } catch (e) {
            try {
                response = buildError(decoder.getFirstValueByName("error"), decoder.getFirstValueByName("error_description"));
            } catch (e) {
                response = buildError("error", "An error ocurred");
            }
        }
        return response;
    }

    /**
     * Builds an error response
     */
    function buildError(error, description) {
        return {
            error: error,
            error_description: description,
            handled: true
        }
    }

    var manager = {
        /**
         * User Cancelled constant
         */
        USER_CANCELLED: USER_CANCELLED,

        /**
         * Authenticates to the remote service using Win8's WebAuthenticationBroker.
         * It requires the login URI and the redirect URI
         * Returns a promise that is resolved on success with {token, expires_in} and rejected on error/cancel with {error, error_description}
         */
        authenticate: function (uri, redirectUri) {
            var winAuth = Windows.Security.Authentication.Web;
            return winAuth.WebAuthenticationBroker.authenticateAsync(winAuth.WebAuthenticationOptions.none, Windows.Foundation.Uri(uri), Windows.Foundation.Uri(redirectUri))
                .then(
                    function (result) {
                        if (result.responseStatus == Windows.Security.Authentication.Web.WebAuthenticationStatus.success) {
                            // Redirect URI was called, but it could contain a successful message or an error
                            var response = parseTokenResponse(result.responseData);
                            if (!response.error) {
                                // Success. The promise in resolved
                                return response;
                            } else {
                                // Error, reject the promise
                                throw response;
                            }
                        } else if (result.responseStatus === Windows.Security.Authentication.Web.WebAuthenticationStatus.errorHttp) {
                            // HTTP error 
                            throw buildError("server_error", "There was a problem with the connection");
                        } else {
                            // User cancelled   
                            //throw buildError(USER_CANCELLED, "");
                        }
                    },
                    function (err) {
                        // Win8 WebAuthenticationBroker error
                        throw buildError("error", err.message);
                    }
                );
            }
        }

    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.MVC", {
        AuthenticationHelper: manager
    });

})();