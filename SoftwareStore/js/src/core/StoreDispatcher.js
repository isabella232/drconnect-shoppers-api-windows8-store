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
            declareUrlMappings: function (u, c) {
                this.addUrlMapping(u.HOME_PAGE, c.homeController);
                this.addUrlMapping(u.PRODUCT_PAGE, c.productController);
                this.addUrlMapping(u.CATEGORY_PAGE, c.categoryController);
                this.addUrlMapping(u.CART_PAGE, c.cartController);
            },

            /**
             * Sharing Mappings
             */
            declareSharingMappings: function (u, c) {
                this.addSharingMapping(u.PRODUCT_PAGE, c.productController, true);
            },

            /**
             * Notification Mapping
             */
            declareMappings: function (n, c) {
                this.addMapping(n.ADD_TO_CART, c.cartController, "addToCart");
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