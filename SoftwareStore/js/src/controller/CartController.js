(function () {
    "use strict";
    /**
     * Cart page controller
     */
    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page, state) {
                page.addEventListener(page.events.ITEM_SELECTED, this._onCartItemSelected.bind(this), false);
                return DR.Store.Services.cartService.get().then(function (cart) {
                    page.setCart(cart);
                });
            },

            /**
             * Handles AddToCart notifications
             */
            addToCart: function (args) {
                var self = this;
                DR.Store.Services.cartService.addToCart(args.product, args.qty, args.addToCartUri)
                .then(function (data) {
                    self.goToPage(DR.Store.URL.CART_PAGE);
                });
            },

            /*addProductsToCart: function (args) {
                var self = this;
                var promises = [];
                args.forEach(function (productToAdd) {
                    promises.push(DR.Store.Services.cartService.addToCart(productToAdd.product, 1, productToAdd.addToCartUri));
                });
                console.log(args.length);

                WinJS.Promise.join(promises).then(function (data) {
                    self.goToPage(DR.Store.URL.CART_PAGE);
                });
            },*/

            addProductsToCart: function (args) {
                var self = this;
                var list = [];
                var productToAdd;
                if (args.length > 0) {
                    productToAdd = args.splice(0,1)[0];
                    DR.Store.Services.cartService.addToCart(productToAdd.product, 1, productToAdd.addToCartUri).then(function (data) {
                        if (args.length > 0) {
                            self.addProductsToCart(args);
                        } else {
                            self.goToPage(DR.Store.URL.CART_PAGE);
                        }
                    });
                }
            },

            _onCartItemSelected: function (e) {
                this.goToPage(DR.Store.URL.PRODUCT_PAGE, e.detail);
            }
        }
    );

    // PRIVATE METHODS
   
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        CartController: Class
    });

})();