(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        events: {
            ITEM_SELECTED: "itemSelected"
        },
        itemsList: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.itemsList = this.element.querySelector(".itemslist").winControl;
            this.itemsList.oniteminvoked = this._onItemInvoked.bind(this);
        },
        setHomeItems: function (groupedItems) {
            this.itemsList.groupHeaderTemplate = this.element.querySelector(".headertemplate");
            this.itemsList.itemTemplate = this.element.querySelector(".itemtemplate");

            this.itemsList.itemDataSource = groupedItems.dataSource;
            this.itemsList.groupDataSource = groupedItems.groups.dataSource;
            this.itemsList.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", maxRows: 5 });
        },
        _onItemInvoked: function (args) {
            var self = this;
            args.detail.itemPromise.then(function (item) {
                self.dispatchEvent(self.events.ITEM_SELECTED, { item: item.data });
            });
        }
    });
})();
