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
            getOffersByPop: function (params) {
                var popName = "SiteMerchandising_HomePageStoreSpecials"

                var self = this;
                console.debug("Calling DR getOffersForProduct");

                return this._client.offers.list(popName, { "expand": "all" }).then(function (offers) {
                    return offers;
                });
            },

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        OfferService: Class
    });

})();
