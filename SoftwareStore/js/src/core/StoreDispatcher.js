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
            declareUrlMappings: function (c) {
                this.addUrlMapping(DR.Store.URL.HOME_PAGE, c.homeController);
                this.addUrlMapping(DR.Store.URL.PRODUCT_PAGE, c.productController);
                this.addUrlMapping(DR.Store.URL.CATEGORY_PAGE, c.categoryController);
                this.addUrlMapping(DR.Store.URL.CART_PAGE, c.cartController);
            },

            /**
             * Notification Mapping
             */
            declareMappings: function (c) {
                this.addMapping(DR.Store.Notifications.ADD_TO_CART, c.cartController, "addToCart");
            },

            /**
             * Controller instances
             */
            initControllers: function() {
                var c = DR.Store.Controller;
                return {
                    homeController: new c.HomeController(),
                    productController: new c.ProductController(),
                    cartController: new c.CartController(),
                    categoryController: new c.CategoryController()
                }
            }
        }
        );

    WinJS.Namespace.define("DR.Store.Core", {
        StoreDispatcher: Class
    });

})();