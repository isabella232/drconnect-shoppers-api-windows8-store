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
                error: this.errorHandler, 
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
                if (sessionInfo) {
                    this.restartFromSuspension(sessionInfo);
                    return WinJS.Promise.as(true);
                } else
                    return this._client.connect();
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
                if (this.checkInternetConnection()) {
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
                } else {
                    console.debug("No Internet Connection!");
                }
                
            },

            /**
             * Handles any error but session expiration 
             */
            genericErrorHandler: function(error) {
                // Show an error notification
                //var error = "There was a problem with the connection, please try again later";
                //if(description && description != "") error = description;
        
                DR.Store.App.dispatcher.handle(DR.Store.Notifications.SHOW_ERROR, error);
                //// If the status code is 500 it redirects to an error page
                //if(status == 500){
        	    //    var serverError = {"status": status, "code": code, "description": description}
        	    //    dispatcher.handle(dr.acme.runtime.NOTIFICATION.SERVER_ERROR, serverError);
                //}else{
        	    //    dr.acme.util.DialogManager.showError(error, "A problem ocurred");
                //}        
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
