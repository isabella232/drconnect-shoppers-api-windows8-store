(function () {
    "use strict";

    /**
     * Url Navigation Manager
     * Handles URL changes.
     * 
     */
    //TODO Handler security
    var Class = WinJS.Class.define(
        function (dispatcher) {
            this.controllers = dispatcher.controllers;
            this.urlMappings = dispatcher.urlMappings;
            this.mappings = dispatcher.mappings;
            this.dispatcher = dispatcher;
        },
        {
            /**
             * Handle URI change notifications
             */
            handle: function (data) {
                this.doHandle(data.location, data);
            },

            /**
             * Handle URI change notifications.
             * Throws an exception if the mapping is not found or if the user has no access to it
             */
            doHandle: function (uri, params) {
                console.log("Navigating to " + uri);
                var mapping = this.urlMappings[uri];

                if (!mapping) throw new Error("No URL Mapping found for " + uri);

                // if (mapping.secured) this.applySecurity();

                mapping.controller[mapping.method](params);
            }

        }
        );

    WinJS.Namespace.define("DR.MVC", {
        UrlNavigationManager: Class
    });

})();