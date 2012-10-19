/**
 * User Service.
 * Responsible for authenticating (using oAuth2 flow) and connecting to the shopper endpoint in DR Rest API and caching the results.
 */
(function () {
    "use strict";

    var Class = DR.Class.extend(
        function (client) {
            this._client = client;
            this.resetUserData();
        },
        {
            _client: null,
            authenticated: false,
            USER_CANCELLED: "user_cancel",

            /**
             * Returns whether the user is authenticated or anonymous.
             */
            isAuthenticated: function () {
                return this.authenticated;
            },

            /**
             * Clears all User (Shopper) related data
             */
            resetUserData: function () {
                this.authenticated = false;
                //this.shopper = null;
                //this.resetPersonalInformation();
            },

            /** 
             * Starts the authentication process
             */
            login: function () {
                var self = this;
                return this._client.login(function (authHelper) {
                    self._doWinLogin(authHelper);
                });
            },

            /**
             * Uses Win8 framework to connect to DR Authentication Service
             */
            _doWinLogin: function (authHelper) {
                var winAuth = Windows.Security.Authentication.Web;
                var self = this;

                winAuth.WebAuthenticationBroker.authenticateAsync(winAuth.WebAuthenticationOptions.none, Windows.Foundation.Uri(authHelper.uri), Windows.Foundation.Uri("http://shopme.digitalriver-external.com/drapi-auth.html"))
                .done(
                        function (result) {
                            if (result.responseStatus == Windows.Security.Authentication.Web.WebAuthenticationStatus.success) {
                                this.authenticated = true;
                                authHelper.setResults();
                            } else if (result.responseStatus === Windows.Security.Authentication.Web.WebAuthenticationStatus.errorHttp) {
                                authHelper.setError("server_error", "There was a problem with the connection");
                            } else {
                                // User cancelled   
                                authHelper.setError(self.USER_CANCELLED, "");
                            }
                            
                        },
                        function (err) {
                            authHelper.setError("error", err.message);
                        }
                );
            },


        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        UserService: Class
    });

})();
