/** 
 * Controller that handles user authentication
 */
(function () {
    "use strict";

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            /**
            * Loads the data and passes it to the page on initialization
            */
            initPage: function (page, state) {

            }
           
        }
        );

    WinJS.Namespace.define("DR.Store.Controller", {
        OfferController: Class
    });

})();