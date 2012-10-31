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
            authenticated: false,
            

            /**
             * Clears all User (Shopper) related data
             */
            resetUserData: function () {
                this.authenticated = false;
                //this.shopper = null;
                //this.resetPersonalInformation();
            },

        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        UserService: Class
    });

})();
