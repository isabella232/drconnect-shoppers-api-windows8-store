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
                page.addEventListener(page.events.SHIPPING_ADDRESS_CHANGED, this._onShippingAddressChanged.bind(this), false);
                page.addEventListener(page.events.SHIPPING_OPTION_CHANGED, this._onShippingOptionChanged.bind(this), false);

                DR.Store.Services.userService.getAddresses().then(function (addresses) {
                    page.setAddresses(addresses);
                }, function (error) {
                    console.log("CheckoutController: Error getting shopper's addresses: " + error.details.code + " - " + error.details.description);
                });

                DR.Store.Services.userService.getPaymentOptions().then(function (paymentOptions) {
                    page.setPaymentOptions(paymentOptions);
                }, function (error) {
                    console.log("CheckoutController: Error getting shopper's payment options: " + error.details.code + " - " + error.details.description);
                });

                return DR.Store.Services.cartService.applyShopper().then(function (cart) {
                    page.setCart(cart);
                }, function (error) {
                    console.log("CheckoutController: Error applying shopper to cart: " + error.details.code + " - " + error.details.description);
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
                    return DR.Store.Services.cartService.applyShopper(null, params.billingAddressId, params.paymentOptionId).then(function (cart) {
                        self._doSubmit(params.cart);
                    }, function (error) {
                        console.log("CheckoutController: Error applying shopper to cart: " + error.details.code + " - " + error.details.description);
                    });
                } else {
                    return self._doSubmit(params.cart);
                }
            },

            /**
             * Behaviour when shipping address changes
             */
            _onShippingAddressChanged: function (e) {
                var self = this;
                var params = e.detail;
                DR.Store.Services.cartService.applyShopper(params.shippingAddressId, params.billingAddressId, params.paymentOptionId).then(function (cart) {
                    self.page.setCart(cart);
                }, function (error) {
                    console.log("CheckoutController: Error applying shopper to cart: " + error.details.code + " - " + error.details.description);
                });
            },

            /**
             * Behaviour when shipping option changes
             */
            _onShippingOptionChanged: function (e) {
                var self = this;
                var optionId = e.detail;
                DR.Store.Services.cartService.applyShippingOption(optionId).then(function (cart) {
                    self.page.setCart(cart);
                }, function (error) {
                    console.log("CheckoutController: Error applying shipping option to cart: " + error.details.code + " - " + error.details.description);
                });
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