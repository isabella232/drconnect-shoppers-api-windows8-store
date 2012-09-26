(function () {
    "use strict";
    /**
     * Service manager for the App.
     */
    var Class = DR.MVC.BaseServiceManager.extend(
        function (key) {
            this._client = new dr.api.Client(key);

            this.categoryService = new DR.Store.Service.CategoryService(this._client);
            this.productService = new DR.Store.Service.ProductService(this._client);
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
