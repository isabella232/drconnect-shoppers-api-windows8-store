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
                authRedirectUrl: this.redirectUri
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
                //return "http://drapp/" + key + "/";
                return "http://shopme.digitalriver-external.com/drapi-auth.html";
            },

            /**
             * Connects to DR Api using the provided Key
             */
            initialize: function () {
                return this._client.connect();
            },
            getSessionInfo: function () {
                return this._client.getSessionInfo();
            }
        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        ServiceManager: Class
    });

})();
