/**
 * User Service.
 * Responsible for authenticating (using oAuth2 flow) and connecting to the shopper endpoint in DR Rest API and caching the results.
 */
(function () {
    "use strict";

    var Class = DR.Class.extend(
        //TODO see if redirecturi can be obtained from client
        function (client, redirectUri) {
            this._client = client;
            this.redirectUri = redirectUri;
            this.resetUserData();
        },
        {
            _client: null,
            authenticated: false,
            
            /**
             * Returns whether the user is authenticated or anonymous.
             */
            isAuthenticated: function () {
                return this.authenticated;
            },

            /**
             * Sets the authenticated flag
             */
            setAuthenticated: function(authenticated){
                this.authenticated = authenticated;
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
                return this._client.login(this._doWinLogin.bind(this));
            },

            /**
             * Uses Win8 framework to connect to DR Authentication Service
             */
            _doWinLogin: function (authHelper) {
                var self = this;

                // Call Authentication helper
                DR.MVC.AuthenticationHelper.authenticate(authHelper.uri, this.redirectUri)
                .then(
                        function (response) {
                            // Set Authenticated flag, so the application allow access to secured pages
                            self.authenticated = true;

                            authHelper.setResults(response.token, response.expirationTime);
                        },
                        function (response) {
                            authHelper.setError(response.error, response.error_description);
                        }
                    );
            },

            checkConnection: function () {
                return this._client.checkConnection();
            },

            getSessionInfo: function () {
                return this._client.getSessionInfo();
            }
        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        SecurityService: Class
    });

})();
