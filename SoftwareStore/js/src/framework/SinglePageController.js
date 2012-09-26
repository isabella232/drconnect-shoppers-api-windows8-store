(function () {
    "use strict";
    /**
     * Super Class for Controllers that show a page
     */
    var Class = DR.MVC.BaseController.extend(
        function () {
            this._super();
        },
        {
            page: null,
            /**
             *  Handles the request by showing the appropriate page
             */
            handle: function (detail) {
                this.showPage(detail)
                    .then(function(control) {
                        this.page = control;
                        if (this.page) {
                            console.log("Page loaded, initializing...");
                            this.initPage(this.page, detail.state);
                        }
                    }.bind(this));
            },

            /**
             * Template method that should be overriden to init the recently loaded page
             */
            initPage: function (page, state) { }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        SinglePageController: Class
    });

})();