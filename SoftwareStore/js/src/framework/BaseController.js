(function () {
    "use strict";

    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */
    var Class = DR.Class.extend(
        function () {
            this.pageNavigator = DR.Store.App.pageNavigator;
        },
        {
            pageNavigator: null,
            showPage: function (detail) {
                console.log("Showing page with URI " + detail.location);
                var p = this.pageNavigator.goToPage(detail.location, detail.state).then(function (page) {
                    if (page.clear) {
                        page.clear();
                    }
                    return page;
                });
                if (p) {
                    detail.setPromise(p);
                }
                return p;
            },

            /**
             * Sends a notification to the AcmeDispatcher so other parts of the app can react to this event.
             * 
             * @param notificationName	String describing the notification that want to be forwarded
             * @param data				JSON object with possible params to be forwarded
             */
            notify: function (notificationName, data) {
                var dispatcher = DR.Store.App.getDispatcher();
                dispatcher.handle(notificationName, data);
            },

            /**
             * Navigates to the provided URL
             */
            goToPage: function (url, data) {
                DR.Store.App.navigateTo(url, data);
            }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        BaseController: Class
    });

})();