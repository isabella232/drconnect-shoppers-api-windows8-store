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
                    console.log("CheckoutController: Error getting shopper's addresses: " + error.details.error.code + " - " + error.details.error.description);
                });

                DR.Store.Services.userService.getPaymentOptions().then(function (paymentOptions) {
                    page.setPaymentOptions(paymentOptions);
                }, function (error) {
                    console.log("CheckoutController: Error getting shopper's payment options: " + error.details.error.code + " - " + error.details.error.description);
                });

                return DR.Store.Services.cartService.applyShopper().then(function (cart) {
                    page.setCart(cart);
                }, function (error) {
                    console.log("CheckoutController: Error applying shopper to cart: " + error.details.error.code + " - " + error.details.error.description);
                });

            },

            /**
             * Default Behaviour when a checkout button is clicked on the cart page
             */
            _onSubmit: function (e) {
                var self = this;
                var params = e.detail;
                // Send notification to block the application. Don't show any message because after applying the cart, the submit message would be shown
                self.notify(DR.Store.Notifications.BLOCK_APP);
                // If a any address or payment has been modified applies the shopper first
                if (params.shippingAddressId || params.billingAddressId || params.paymentOptionId) {
                    return DR.Store.Services.cartService.applyShopper(null, params.billingAddressId, params.paymentOptionId).then(function (cart) {
                        self._doSubmit(params.cart);
                    }, function (error) {
                        console.log("CheckoutController: Error applying shopper to cart: " + error.details.error.code + " - " + error.details.error.description);
                        self.notify(DR.Store.Notifications.UNBLOCK_APP);
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
                // Send notification to block the application
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.applyShippingAddress").value);
                DR.Store.Services.cartService.applyShopper(params.shippingAddressId, params.billingAddressId, params.paymentOptionId).then(function (cart) {
                    self.page.setCart(cart);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                }, function (error) {
                    console.log("CheckoutController: Error applying shopper to cart: " + error.details.error.code + " - " + error.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                });
            },

            /**
             * Behaviour when shipping option changes
             */
            _onShippingOptionChanged: function (e) {
                var self = this;
                var optionId = e.detail;
                // Send notification to block the application
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.applyShippingOption").value);
                DR.Store.Services.cartService.applyShippingOption(optionId).then(function (cart) {
                    self.page.setCart(cart);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                }, function (error) {
                    console.log("CheckoutController: Error applying shipping option to cart: " + error.details.error.code + " - " + error.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                });
            },

            /**
             * Submits the cart
             */
            _doSubmit: function (cart) {
                var self = this;
                // Send notification to block the application
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.submitCart").value);
                return DR.Store.Services.cartService.submit().then(function (data) {
                    self.goToPage(DR.Store.URL.THANKS_PAGE, cart);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                }, function (error) {
                    console.log("CheckoutController: Error submiting the cart: " + error.details.error.code + " - " + error.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
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