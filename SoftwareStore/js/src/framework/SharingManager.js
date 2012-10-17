/**
 * Sharing Manager
 * Calls the appropiate controller when sharing is requested.
 * Manages async sharing processes
 */
(function () {
    "use strict";
    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();

    var Class = DR.MVC.UrlMapper.extend(
        function (app, mappings) {
            this._super(mappings);

            this.app = app;

            // Add Win8 sharing event handler
            dataTransferManager.ondatarequested = this.onShareRequest.bind(this);

            // Sharing manager should not throw an error on not found, it should just return nothing
            this.failOnMappingNotFound = false;

            this.notFoundMessage = "No sharing handler was defined for page with URI";
        },
        {
            /**
             * Event handler for Win8 sharing event
             */
            onShareRequest: function (e) {
                console.log("Sharing request received");
                this.handle({ location: this.app.getCurrentUrl(), sharingEvent: e });
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
                            var errorMessage = WinJS.Resources.getString('/errors/sharing.errorMessage').value;
                            sharingAdapter.fail(errorMessage);
                        });
                }
            }
        }
        );

    WinJS.Namespace.define("DR.MVC.Sharing", {
        SharingManager: Class
    });

})();