// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/category/category.html", {
        productsList: null,
        subcategoriesList: null,
        
        // EVENTS
        events: {
            PRODUCT_SELECTED: "productSelected",
            SUBCATEGORY_SELECTED: "subcategorySelected"
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.productsList = element.querySelector("#listProducts").winControl;
            this.subcategoriesList = element.querySelector("#listSubcategories").winControl;
            
            this.productsList.itemTemplate = element.querySelector(".productTemplate");
            this.productsList.oniteminvoked = this._onProductInvoked.bind(this);

            this.subcategoriesList.itemTemplate = element.querySelector(".subcategoryTemplate");
            this.subcategoriesList.oniteminvoked = this._onSubcategoryInvoked.bind(this);
        },

        setCategoryName: function (name) {
            this.element.querySelector(".pagetitle").textContent = name;
        },

        setProducts: function (products) {
            var l = new WinJS.Binding.List();
            products.forEach(function (p) {
                l.push(p);
            });
            this.productsList.itemDataSource = l.dataSource;
        },
        setSubcategories: function (subcategories) {
            var l = new WinJS.Binding.List();
            subcategories.forEach(function (p) {
                l.push(p);
            });
            this.subcategoriesList.itemDataSource = l.dataSource;
        },

        dataLoaded: function () {
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
