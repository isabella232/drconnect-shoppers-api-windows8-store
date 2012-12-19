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
             * return an specific offer using a POPName
             */
            getOffersByPop: function (popName, params) {

                var self = this;
                console.debug("Calling DR getOffersForProduct");

                return this._client.offers.list(popName, { "expand": "all" }, null, true).then(function (offers) {
                    return offers;
                }, function (error) {
                    if (error.details.error.code === "OFFERS_UNAVAILABLE") {
                        console.log("No offers for this POP");
                    }
                });
            },

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        OfferService: Class
    });

})();
