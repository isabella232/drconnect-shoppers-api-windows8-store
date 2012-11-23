/**
 * User Service.
 * Manages all the services related to the shopper
 */
(function () {
    "use strict";

    var Class = DR.Class.extend(
        function (client) {
            this._client = client;
        },
        {
            _client: null,

            /**
             * return an specific order with details
             * Cache not implemented for this service
             */

            getOrder: function (orderId) {
                console.log("Retrieving order " + orderId);
                var self = this;
                return self._client.orders.get(orderId, { "expand": "shippingAddress, billingAddress" }).then(function (order) {
                    return order;
                });
            }

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        OrderService: Class
    });

})();
