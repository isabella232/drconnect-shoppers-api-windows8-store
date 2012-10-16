/**
 * Sharing Manager
 * Calls the appropiate controller when sharing is requested.
 * Manages async sharing processes
 */
(function () {
    "use strict";

    var Class = DR.MVC.UrlMapper.extend(
        function (dispatcher) {
            this._super(dispatcher.sharingMappings);

            // Sharing manager should not throw an error on not found, it should just return nothing
            this.failOnMappingNotFound = false;

            this.notFoundMessage = "No sharing handler was defined for page with URI";
        },
        {
            /**
             * Logic executed before calling the controller
             */
            beforeControllerCall: function (mapping, sharingEvent) {
                if (mapping.async) {
                    console.log("The sharing is async");
                    var deferral = params.request.getDeferral();
                }
            },

            /**
             * Handle URI change notifications by calling the sharing handler.
             * Async sharing is handled here using WinJS's deferral.
             * Also, errors are handled by addind an error message
             */
            doHandle: function (uri, e) {
                console.log("Sharing resource on current page (" + uri + ")");
                
                var sharingAdapter = new DR.MVC.Sharing.SharingAdapter(e.sharingEvent);

                var promise = this._super(uri, sharingAdapter);

                var mapping = this.getMapping(uri);

                // Async sharing logic
                if (mapping && mapping.async && promise) {
                    console.log("The sharing logic is async");
                    sharingAdapter.makeAsync();
                    promise.then(
                        function () {
                            sharingAdapter.finish();
                        },
                        function () {
                            sharingAdapter.fail(DR.Store.App.locale.getMessage("sharing.errorMessage"));
                        });
                }
            }
        }
        );

    WinJS.Namespace.define("DR.MVC.Sharing", {
        SharingManager: Class
    });

})();