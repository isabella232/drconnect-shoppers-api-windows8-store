/**
 * User Service.
 * Manages all the services related to the shopper
 */
(function () {
    "use strict";

    var Class = DR.Class.extend(
        function (client) {
            this._client = client;
            //this.resetUserData();
        },
        {
            _client: null,
            _addresses: null,
            _paymentOptions: null,
            authenticated: false,
            

            /**
             * Clears all User (Shopper) related data
             */
            resetUserData: function () {
                this.authenticated = false;
                //this.shopper = null;
                //this.resetPersonalInformation();
            },

            /**
             * returns the Shopper Addresses from the api library
             */
            getAddresses: function () {
                console.log("Retrieving addresses");
                var self = this;
                return this._client.shopper.getAddresses({ "expand": "all" }).then(function (data) {
                    self._addresses = data;
                    return data;
                });
            },
            /**
	         * Gets the payment options for the shopper
	         */
            getPaymentOptions: function () {
                console.log("Retrieving payment options for shopper");
                var self = this;
                return this._client.shopper.getPaymentOptions({ "expand": "all" }).then(function (data) {
                    self._paymentOptions = data;
                    return data;
                });
            },

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        UserService: Class
    });

})();
