(function () {
    "use strict";
    /**
     * Super Class for the service manager
     * The app must implement the actual services
     */
    var Class = DR.Class.extend(
        function () {
        },
        {
            initialize: function () {
            }
        }
    );

    WinJS.Namespace.define("DR.MVC", {
        BaseServiceManager: Class
    });

})();