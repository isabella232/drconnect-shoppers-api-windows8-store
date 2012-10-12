/**
 * Url Navigation Manager
 * Handles URL changes.
 * 
 */
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    //TODO Handle security
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

            /** 
             * Gets the current URL
             */
            getCurrentUrl: function () {
                return this.getLastMappedUrl();
            },

            /**
             * Navigates to the specified URL using the arguments
             */
            goToPage: function (url, data) {
                nav.navigate(url, data);
            }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        UrlNavigationManager: Class
    });

})();