/**
 * Service manager for the App.
 */
(function () {
    "use strict";

    //TODO Make it Configurable
    var REDIRECT_URI = "http://shopme.digitalriver-external.com/drapi-auth.html";

    var Class = DR.MVC.BaseServiceManager.extend(
        function (key) {
            var options = {
                authMode: dr.api.authModes.MANUAL,
                authRedirectUrl: REDIRECT_URI
            };
            this._client = new dr.api.Client(key, options);

            this.categoryService = new DR.Store.Service.CategoryService(this._client);
            this.productService = new DR.Store.Service.ProductService(this._client);
            this.cartService = new DR.Store.Service.CartService(this._client);
            this.userService = new DR.Store.Service.UserService(this._client);
        },
        {
            _client: null,
            categoryService: null,

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
