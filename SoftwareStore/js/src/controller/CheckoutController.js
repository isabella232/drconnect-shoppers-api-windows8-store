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
                // Adds a listener for the submit cart button
                page.addEventListener(page.events.SUBMIT_CLICKED, this._onSubmit.bind(this), false);

                DR.Store.Services.userService.getAddresses().then(function (addresses) {
                    page.setAddresses(addresses);
                });

                DR.Store.Services.userService.getPaymentOptions().then(function (paymentOptions) {
                    page.setPaymentOptions(paymentOptions);
                });

                return DR.Store.Services.cartService.applyShopper().then(function (cart) {
                    page.setCart(cart);
                });

            },

            /**
             * Default Behaviour when a checkout button is clicked on the cart page
             */
            _onSubmit: function (e) {
                var self = this;
                var params = e.detail;
                // If a any address or payment has been modified applies the shopper first
                if (params.shippingAddressId || params.billingAddressId || params.paymentOptionId) {
                    return DR.Store.Services.cartService.applyShopper(params.shippingAddressId, params.billingAddressId, params.paymentOptionId).then(function (cart) {
                        self._doSubmit(params.cart);
                    });
                } else {
                    return self._doSubmit(params.cart);
                }
            },

            /**
             * Submits the cart
             */
            _doSubmit: function (cart) {
                var self = this;
                return DR.Store.Services.cartService.submit().then(function (data) {
                    self.goToPage(DR.Store.URL.THANKS_PAGE, cart);
                });
            }

        }
    );

    // PRIVATE METHODS
   
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        CheckoutController: Class
    });

})();