/**
 * Service manager for the App.
 */
(function () {
    "use strict";

    
    var Class = DR.MVC.BaseServiceManager.extend(
        function (key) {
            this.redirectUri = this.generateAuthRedirectUri(key);

            var options = {
                authMode: dr.api.authModes.MANUAL,
                authRedirectUrl: this.redirectUri,
                error: this.errorHandler.bind(this), 
            };

            this._client = new dr.api.Client(key, options);

            this.categoryService = new DR.Store.Service.CategoryService(this._client);
            this.productService = new DR.Store.Service.ProductService(this._client);
            this.cartService = new DR.Store.Service.CartService(this._client);
            this.userService = new DR.Store.Service.UserService(this._client, this.redirectUri);
            this.securityService = new DR.Store.Service.SecurityService(this._client, this.redirectUri);
            this.orderService = new DR.Store.Service.OrderService(this._client);
            this.offerService = new DR.Store.Service.OfferService(this._client);
        },
        {
            _client: null,
            categoryService: null,

            generateAuthRedirectUri: function(key) {
                return "http://drapp/" + key + "/";
            },

            /**
             * Connects to DR Api using the provided Key
             */
            initialize: function (sessionInfo) {
                var self = this;
                if (sessionInfo) {
                    this.restartFromSuspension(sessionInfo);
                    return WinJS.Promise.as(true);
                } else
                    return this._client.connect().then(null, function (error) {
                        console.log("Error Connection Session");
                        // If an connection error occurs, wrap a successfull response in order to initialize all other application objects
                        // If the problem is solved in the next calls the application will connect
                        return WinJS.Promise.wrap(true);
                    });
            },

            getSessionInfo: function () {
                return this._client.getSessionInfo();
            },

            restartFromSuspension: function(sessionInfo){
                this._client.setSessionInfo(sessionInfo);
                this.securityService.setAuthenticated(sessionInfo.authenticated);

            },

             /**
             * Handles errors for DR Service
             */    
            errorHandler: function(response) {
                var code = "";
                var description = "";
                var status = response.status;
                if(response.details.error) {
                    code = (response.details.error.code)? response.details.error.code: "";
                    description = (response.details.error.description)? response.details.error.description: "";
                } 
        
                console.log("DR API Library Error: (status " + status + ") " + code + " - " + description);

                var manager = DR.Store.App.serviceManager;

                // If the status code is 401 or 500 it checks the internet connection in order to define if there is an internet issue
                // or if it is an api issue
                if (status === 401 || status === 500) {
                    if (!this.checkInternetConnection()) {
                        DR.Store.App.dispatcher.handle(DR.Store.Notifications.CONNECTION_ERROR, response);
                        return;
                    } else {
                        // The device is connected to the internet there is a api connection issue, so it sets the status to 401 in order to make
                        // the error be handled by sessionExpiredErrorHandler who will try to connect/reconnect to the API
                        status = 401;
                    }
                }
        
                // If status = 401, special handling is required
                if(status == 401) {
                    manager.sessionExpiredErrorHandler(response);
                } else {
                    manager.genericErrorHandler(response);
                }
            },
            /**
             * Handles session expired errors
             */
            sessionExpiredErrorHandler: function (response) {
               
                console.info("Session Expired, reconnecting...");
                this._client.disconnect();
                var that = this;
                if (!this.reconnectingFlag || response.details.error.code === "refresh_token_invalid") {
                    this.reconnectingFlag = true;
                    this.initialize().then(function () {
                        console.info("Reconnected to DR!");
                        that.reconnectingFlag = false;
                        DR.Store.App.dispatcher.handle(DR.Store.Notifications.SESSION_RESET);
                        DR.Store.App.navigationManager.refreshPage();
                    }, function () {
                        that.reconnectingFlag = false;
                    });
                }
               
            },

            /**
             * Handles any error but session expiration 
             */
            genericErrorHandler: function (error) {
                // If the error has been already handled by the service.. no default action is fired
                if(!error.handled)
                    DR.Store.App.dispatcher.handle(DR.Store.Notifications.SHOW_ERROR, error);
            },

            /*
             * Calls a WinJs Utility to check if the device is connected to the internet
             */
            checkInternetConnection: function () {
                var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
                var networkConnectivityInfo = Windows.Networking.Connectivity.NetworkConnectivityLevel;
               
                var connectionProfile = networkInfo.getInternetConnectionProfile();
                if (connectionProfile == null) {
                    return false;
                }

                var networkConnectivityLevel = connectionProfile.getNetworkConnectivityLevel();
                if (networkConnectivityLevel == networkConnectivityInfo.none
                    || networkConnectivityLevel == networkConnectivityInfo.localAccess
                    || networkConnectivityLevel == networkConnectivityInfo.constrainedInternetAccess) {
                    return false;
                }

                return true;
            }

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        ServiceManager: Class
    });

})();
