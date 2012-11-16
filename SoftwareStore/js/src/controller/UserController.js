/** 
 * Controller that handles user authentication
 */
(function () {
    "use strict";

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            /**
             * Used when the user is redirected to the login page.
             * The originally requested URL is stored so the app can navigate there after successful login
             */
            requestedUrl: null,

            /**
             *  Handles the login
             */
            login: function (requestedUrl) {
                
                // If the login process was triggered by the user trying to access a secured page,
                // store the page url to go there after authentication
                if (requestedUrl) {
                    this.requestedUrl = requestedUrl;
                }

                var self = this;

                // Call a getCart First to check that the token has not expired.. if not, the token would be refreshed so next time 
                // you the login page will appear correctly
                DR.Store.Services.cartService.get().then(function () {
                    // Calls the user service to login
                    DR.Store.Services.securityService.login()
                    .then(function () {
                        // Success, go to the originally requested page
                        console.log("User logged in!");

                        if (self.requestedUrl) {
                            self.goToPage(self.requestedUrl);
                        }

                        self.requestedUrl = null;
                    })
                    .fail(function (resp) {
                        // Error or user cancelled
                        if (resp.details.error != DR.MVC.AuthenticationHelper.USER_CANCELLED) {
                            // TODO SHOW ERROR
                            console.log("Error while logging in: " + resp.details.error + " (" + resp.details.error_description + ")");
                        }
                        self.requestedUrl = null;
                    });
                });
            },

            sessionReset: function () {
                //TODO: Handle the different behaviours when user is authenticated or not
                DR.Store.Services.securityService.resetUserData();
            },

            /**
             * Shows the shopper (profile) page
             */
            initPage: function (page, state) {

            }
        }
        );

    WinJS.Namespace.define("DR.Store.Controller", {
        UserController: Class
    });

})();