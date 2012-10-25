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

            getItemsCount: function(){
                var self = this;
                console.log("Retrieving cart for Items count");

                var params = { expand: "lineItems.lineItem.product.id"};

                return this._client.cart.get(params).then(function (data) {
                    var count = 0;
                    data.lineItems.lineItem.forEach(function(lineItem){
                        count += lineItem.quantity;
                    });
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
                return this._client.cart.addLineItem(product, addToCartUri, { quantity: qty })
                .then(function (data) {
                    console.log("Product '" + product.displayName + "' (qty:" + qty + ") added to cart");
                    return data;
                }, function (error) {
                    console.error("Error when adding a product: " + error);
                    debugger;
                });
            },

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        CartService: Class
    });

})();
