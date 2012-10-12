// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/search/search.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // Gets the List Control
            this.list = element.querySelector("#list").winControl;

            // Sets the items template
            this._productTemplate = element.querySelector(".itemtemplate").winControl;
            this.list.itemTemplate = categoryItemTemplate.bind(this);
            this.list.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", groupInfo: { enableCellSpanning: true, cellWidth: 150, cellHeight: 75 } });
        },

        /**
         * Sets the datasource for the list (including subcategories and products)
         */
        setListDataSource: function (searchDataSource) {
            // Set the item datasource
            this.list.itemDataSource = searchDataSource;

            this._showMessageIfEmpty();
        },

        setKeyword: function (keyword) {
            this.element.querySelector(".titlearea .pagesubtitle").textContent = "Results for “" + keyword + '”';
        },

        /**
         * Shows a message when there are no items to show
         */
        _showMessageIfEmpty: function () {
            var self = this;
            
            this.list.itemDataSource.getCount().then(function (count) {
                if (count == 0) {
                    WinJS.Utilities.removeClass(self.element.querySelector(".resultsmessage"), "hidden");
                }
            });
            
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });

    function categoryItemTemplate(itemPromise) {
        var oSelf = this;
        return itemPromise.then(function (currentItem) {
            var template = oSelf._productTemplate;
            return template.render(currentItem.data);
        });
    }
})();
