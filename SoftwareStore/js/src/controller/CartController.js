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