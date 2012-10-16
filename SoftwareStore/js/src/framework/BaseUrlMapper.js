(function () {
    "use strict";

    /**
     * Base Url Navigation Manager
     * Handles URL changes.
     * 
     */
    //TODO Handler security
    var Class = DR.Class.extend(
        function (mappings) {
            this.urlMappings = mappings;

            // By default, when a mapping is not found, an exception is thrown, since this is unexpected behavior
            this.failOnMappingNotFound = true;
            this.notFoundMessage = "No URL Mapping found for";
        },
        {
            lastMappedUrl: null,
            /**
             * Handle URI change notifications
             */
            handle: function (data) {
                this.doHandle(data.location, data);
            },

            getMapping: function (uri) {
                return this.urlMappings[uri];
            },

            /**
             * Handle URI change notifications.
             * Throws an exception if the mapping is not found or if the user has no access to it
             */
            doHandle: function (uri, params) {
                var mapping = this.urlMappings[uri];

                if (!mapping) {
                    if (this.failOnMappingNotFound) {
                        throw new Error(this.notFoundMessage + " " + uri);
                    } else {
                        console.log(this.notFoundMessage + " " + uri);
                        return;
                    }
                }
                    

                // if (mapping.secured) this.applySecurity();
                this.lastMappedUrl = uri;

                console.log("Mapping found for " + uri);

                return mapping.controller[mapping.method](params);
            },

            getLastMappedUrl: function () {
                return this.lastMappedUrl;
            }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        UrlMapper: Class
    });

})();