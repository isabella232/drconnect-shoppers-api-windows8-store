(function () {
    "use strict";
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */
    var Class = DR.MVC.BaseDispatcher.extend(
        function () {
            this._super();
        },
        {
            /**
             * Mapping of all the URIs 
             */
            declareUrlMappings: function () {
                //var nsu = dr.acme.runtime.URI;
                var c = DR.Store.Controller;
                this.addUrlMapping(DR.Store.URL.HOME_PAGE, new c.HomeController());
                this.addUrlMapping(DR.Store.URL.PRODUCT_PAGE, new c.ProductController());
            },
            declareMappings: function () {

            },
        }
        );

    WinJS.Namespace.define("DR.Store.Core", {
        StoreDispatcher: Class
    });

})();