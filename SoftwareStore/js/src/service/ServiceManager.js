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
            initialize: function () {
                return this._client.connect();
            },
            getSessionInfo: function () {
                return this._client.getSessionInfo();
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
                    manager.genericErrorHandler(status, code, description);
                }
            },
            /**
             * Handles session expired errors
             */
            sessionExpiredErrorHandler: function(response) {
                console.info("Session Expired, reconnecting...");
                var that = this;
                if(!this.reconnectingFlag){
        	        this.reconnectingFlag = true;
	                this.initialize().then(function() {
	                    console.info("Reconnected to DR!");
	                    that.reconnectingFlag = false;
	                    DR.Store.App.navigationManager.refreshPage();
	                    //dispatcher.handle(dr.acme.runtime.NOTIFICATION.UNBLOCK_APP);
	                    //dispatcher.handle(dr.acme.runtime.NOTIFICATION.SESSION_RESET, {"error": response, "requestedUrl": dispatcher.getCurrentUrl()});
	                    //dispatcher.refreshPage();
	                }).fail(function(){
	        	        that.reconnectingFlag = false;
	                });
                } 
            },
            /**
             * Handles any error but session expiration 
             */
            genericErrorHandler: function(status, code, description) {
                // Show an error notification
                var error = "There was a problem with the connection, please try again later";
                if(description && description != "") error = description;
        
                var dispatcher = dr.acme.application.getDispatcher();
                dispatcher.handle(dr.acme.runtime.NOTIFICATION.UNBLOCK_APP);
                // If the status code is 500 it redirects to an error page
                if(status == 500){
        	        var serverError = {"status": status, "code": code, "description": description}
        	        dispatcher.handle(dr.acme.runtime.NOTIFICATION.SERVER_ERROR, serverError);
                }else{
        	        dr.acme.util.DialogManager.showError(error, "A problem ocurred");
                }        
            }

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        ServiceManager: Class
    });

})();
