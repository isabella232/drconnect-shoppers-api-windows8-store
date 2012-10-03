// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/category/category.html", {
        list: null,
        
        // EVENTS
        events: {
            PRODUCT_SELECTED: "productSelected",
            SUBCATEGORY_SELECTED: "subcategorySelected"
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.list = element.querySelector("#list").winControl;
            
            this.list.itemTemplate = element.querySelector(".productTemplate");
            this.list.groupHeaderTemplate = document.getElementById("groupTemplate");
            this.list.oniteminvoked = this._onProductInvoked.bind(this);
        },

        /**
         * Sets the name of the category in the view's title
         */
        setCategoryName: function (name) {
            this.element.querySelector(".pagetitle").textContent = name;
        },

        /**
         * Sets the datasource for the list (including subcategories and products)
         */
       setListDataSource: function (productsDataSource) {
           // Set the item datasource
           this.list.itemDataSource = productsDataSource;

           // Set the group datasource (will include subcategories and products)
           this.list.groupDataSource = productsDataSource.getGroupDataSource();

           this._showMessageIfEmpty();
       },

        /**
         * Shows a message when there are no items to show
         */
       _showMessageIfEmpty: function () {
           var self = this;
           this.list.itemDataSource.getCount().then(function (count) {
               if (count == 0) {
                   WinJS.Utilities.removeClass(self.element.querySelector("#emptyMessage"), "hidden");
               }
           });
       },

       _onProductInvoked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                self.dispatchEvent(self.events.PRODUCT_SELECTED, { item: item.data });
            });
        },

        _onSubcategoryInvoked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                self.dispatchEvent(self.events.SUBCATEGORY_SELECTED, { item: item.data });
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
})();
