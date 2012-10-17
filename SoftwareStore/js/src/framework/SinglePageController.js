(function () {
    "use strict";
    /**
     * Super Class for Controllers that show a page
     * 
     * By default the page is localized. 
     * Set this.localized = false in the constructor to avoid localization processing
     */
    var Class = DR.MVC.BaseController.extend(
        function () {
            this._super();
        },
        {
            page: null,
            localized: true,
            /**
             *  Handles the request by showing the appropriate page.
             */
            handle: function (detail) {
                var self = this;
                this.showPage(detail, this.localized)
                    .then(function(control) {
                        self.page = control;
                        if (self.page) {
                            console.log("Page loaded, initializing...");
                            var p = self.initPage(self.page, detail.state);
                            if (p) {
                                if (!Array.isArray(p)) {
                                    p = [p];
                                }
                                WinJS.Promise.join(p).then(function (results) {
                                    if (self.page.dataLoaded) {
                                        self.page.dataLoaded(results);
                                    }
                                });
                            }
                        }
                    });
            },

            /**
             * Template method that should be overriden to init the recently loaded page
             * If an array of promises is returned, the page's dataLoaded() method will be called when all the promises are resolved
             */
            initPage: function (page, state) { }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        SinglePageController: Class
    });

})();