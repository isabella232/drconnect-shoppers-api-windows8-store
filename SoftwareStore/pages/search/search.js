// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/search/search.html", {
        events: {
            PRODUCT_SELECTED: "productSelected"
        },
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // Gets the List Control
            this.list = element.querySelector("#list").winControl;

            // Sets the items template
            this._productTemplate = element.querySelector(".itemtemplate").winControl;
            this.list.itemTemplate = categoryItemTemplate.bind(this);

            //this.list.addEventListener("selectionchanged", this._itemSelected.bind(this));
            this.list.oniteminvoked = this._onItemInvoked.bind(this);

            this.list.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", maxRows: 6, groupInfo: { enableCellSpanning: true, cellWidth: 70, cellHeight: 70 } });

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
            var searchTitle = WinJS.Resources.getString('search.searchTitle').value;
            this.element.querySelector(".titlearea .pagesubtitle").textContent = searchTitle + "“" + keyword + '”';
        },

        _onItemInvoked: function (args) {
            var self = this;
            args.detail.itemPromise.then(function (item) {
                self.dispatchEvent(self.events.PRODUCT_SELECTED, { item: item.data });
            });
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
            // When unloading nulls the listDataSource to avoid failure if a callback returns after the view has been unloaded
            this.list.itemDataSource = null
        }


        // TODO: Implement this code when the app bar is implemented
      /*  _itemSelected: function (item) {
            var count = this.list.selection.count();
            if (count > 0) {
                this.bottomAppBar.showCommands(["cmdAdd"]);
                this.topAppBar.show();
                this.bottomAppBar.show();
            } else {
                this.topAppBar.hide();
                this.bottomAppBar.hide();
                this.bottomAppBar.hideCommands(["cmdAdd"]);
            }
        }*/

    });

    function categoryItemTemplate(itemPromise) {
        var oSelf = this;
        return itemPromise.then(function (currentItem) {
            var template = oSelf._productTemplate;
            return template.render(currentItem.data);
        });
    }
})();
