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
            _disabledElements: [],
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
            initPage: function (page, state) { },

            /**
             * Blocks the UI disabling the page it is controlling
             */
            blockUI: function () {
                var self = this;
                this.page.element.disabled = true;
                var buttons = this.page.element.querySelectorAll("button");
                for (var i = 0; i < buttons.length; i++) {
                    var button = buttons[i];
                    if(!button.disabled){
                        self._disabledElements.push(button);
                        button.disabled = true;
                    }
                }

                var listViews = this.page.element.querySelectorAll(".win-listview");
                for (var j = 0; j < listViews.length; j++) {
                    var listView = listViews[j];
                    if (!listView.disabled) {
                        self._disabledElements.push(listView);
                        listView.disabled = true;
                    }

                }


            },

            /**
             * Blocks the UI enabling the page it is controlling
             */
            unBlockUI: function () {
                this.page.element.disabled = false;
                this._disabledElements.forEach(function (button) {
                    button.disabled = false;
                });
                this._disabledElements = [];
            }


            
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        SinglePageController: Class
    });

})();