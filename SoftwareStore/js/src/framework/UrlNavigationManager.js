(function () {
    "use strict";

    /**
     * Url Navigation Manager
     * Handles URL changes.
     * 
     */
    //TODO Handler security
    var Class = DR.MVC.UrlMapper.extend(
        function (dispatcher) {
            this._super(dispatcher.urlMappings);
        },
        {
            /**
             * Handle URI change notifications
             */
            doHandle: function (uri, params) {
                console.log("Navigating to " + uri);
                this._super(uri, params);
            },

            getCurrentUrl: function () {
                return this.getLastMappedUrl();
            }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        UrlNavigationManager: Class
    });

})();