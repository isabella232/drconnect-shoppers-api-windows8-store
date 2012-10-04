// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/category/category.html", {
        list: null,
        _productTemplate: null,
        _categoryTemplate: null,

        // EVENTS
        events: {
            ITEM_SELECTED: "itemSelected"
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.list = element.querySelector("#list").winControl;
            
            //this.list.itemTemplate = element.querySelector(".productTemplate");
            this.list.itemTemplate = categoryItemTemplate.bind(this);
            this.list.groupHeaderTemplate = document.getElementById("groupTemplate");
            //this.list.oniteminvoked = this._onProductInvoked.bind(this);
            this.list.oniteminvoked = this._onItemInvoked.bind(this);

            this._productTemplate = element.querySelector(".productTemplate").winControl;
            this._categoryTemplate = element.querySelector(".subcategoryTemplate").winControl;
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

       _onItemInvoked: function (args) {
           var self = this;
           args.detail.itemPromise.then(function (item) {
               self.dispatchEvent(self.events.ITEM_SELECTED, { item: item});
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
        // TODO: Add Handling to the error when the view is disposed, it tries to render the items and fails.
        var oSelf = this;
        return itemPromise.then(function (currentItem) {
            var template;
            switch (currentItem.itemType) {
                case DR.Store.Datasource.ItemType.PRODUCT:
                    template = oSelf._productTemplate;
                    break;
                case DR.Store.Datasource.ItemType.CATEGORY:
                    template = oSelf._categoryTemplate;
                    break;

                default:
                    template = oSelf._productTemplate;
                    break;
            }

            return template.render(currentItem.data);
        });
    }
})();
