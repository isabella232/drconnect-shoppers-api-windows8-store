(function () {
    "use strict";
    /**
     * Cart Service.
     * Responsible for connecting to the cart endpoint in DR Rest API and caching the results.
     */
    var Class = DR.Class.extend(
        function (client) {
            this._client = client;
        },
        {
            _client: null,
            _cart: null,

            /**
             * Gets the cart
             */
            get: function () {
                var self = this;
                console.log("Retrieving cart");

                // Used to get the product Id in the line-item so we can link back to the product page
                var params = { expand: "lineItems.lineItem.product.id"};

                return this._client.cart.get(params).then(function (data) {
                    self._cart = data;
                    return data;
                });
            },

            /**
             * Gets the quantity of items added to the cart
             */
            getItemsCount: function(){
                var self = this;
                console.log("Retrieving cart for Items count");

                var params = { expand: "lineItems.lineItem.product.id"};

                return this._client.cart.get(params).then(function (data) {
                    var count = 0;
                    if (data.lineItems.lineItem) {
                        data.lineItems.lineItem.forEach(function (lineItem) {
                            count += lineItem.quantity;
                        });
                    }
                    return count;
                });

            },

            /**
             * Adds a Product to the Cart
             * @param product product to be added
             * @param qty quantity of product to be added
             * @param addToCartUri Uri to call the service and add the product to the cart. If not null, the service uses this
             * parameter to add the product, otherwise it uses @product
             * @returns 
             */
            addToCart: function (product, qty, addToCartUri) {
                console.log("Calling DR addToCartService");
                return this._client.cart.addLineItem(product, addToCartUri, { quantity: qty })
                .then(function (data) {
                    console.log("Product '" + product.displayName + "' (qty:" + qty + ") added to cart");
                    return data;
                }, function (error) {
                    console.log("Error when adding a product: " + error[0].details.error.code + ": " + error[0].details.error.description);
                });
            },

            /**
            * Edits the Quantity of a line Item
            * @param lineItem lineItem to edit
            * @param qty the new quantity of the lineItem
            * @returns 
            */
            editLineItem: function (lineItem, qty) {
                console.log("Calling DR addToCartService");
                return this._client.cart.editLineItemQuantity(lineItem, { quantity: qty })
                .then(function (data) {
                    console.log("LineItem '" + lineItem.product.displayName + "' (qty:" + qty + ") modified on cart");
                    return data;
                }, function (error) {
                    console.log("Error when trying to modify lineItem: " + error[0].details.error.code + ": " + error[0].details.error.description);
                });
            },

            /**
             * Removes a Line Item from the Cart
             * @param lineItem to be removed
             * @returns Cart
             */
            removeLineItemFromCart: function (lineItem) {
                var self = this;
                console.debug("Calling DR removeFrom service");
                return this._client.cart.removeLineItem(lineItem, {}).then(function (data) {
                    // Invalidate cached cart after submitting it
                    //self.invalidateCache();
                    console.info("Line item removed");
                    return;
                });
            },

            /**
             * Apply Billing and Shipping Addresses to the Cart
             * @param shippingAddressId Id of the shipping address to be applied
             * @param billingAddressId Id of the billing address to be applied
             * @param payementOptionId Id of the payment option to be applied
             * @returns Cart
             */
            applyShopper: function (shippingAddressId, billingAddressId, paymentOptionId) {
                console.debug("Calling DR applyShopper service");

                var self = this;
                var params = {}

                params.expand = "all";
                if (shippingAddressId) params.shippingAddressId = shippingAddressId;
                if (billingAddressId) params.billingAddressId = billingAddressId;
                if (paymentOptionId) params.paymentOptionId = paymentOptionId;

                return this._client.cart.applyShopper(params).then(function (data) {
                        self._cart = data;
                        console.info("Billing and Shipping Addresses applied to Cart");
                        return data;
                    });
            },

            /**
	         * Applies Shipping Options to the cart
	         * @returns
	         */
            applyShippingOption: function (optionId) {
                console.debug("Calling DR applyShippingOption service");
                var params = {}

                params.expand = "all";
                params.shippingOptionId = optionId;
                var self = this;
                return this._client.cart.applyShippingOption(params).then(function (data) {
                    self._cart = data;
                    console.info("Shipping Option applied to Cart");
                    return data;
                });
            },

            /**
             * Submits the Cart
             * @returns Cart
             */
            submit: function (params) {
                console.debug("Calling DR submitCart service");
                return this._client.cart.submit({ "cartId": "active", "includeTestOrders": "true" }).then(function (data) {
                    // Invalidate cached cart after submitting it
                    //that.invalidateCache();
                    console.info("Cart Submitted Successfully");
                    return(data);
                });
            }

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        CartService: Class
    });

})();
