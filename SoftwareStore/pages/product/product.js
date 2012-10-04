// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/product/product.html", {
        events: {
            CART_BUTTON_CLICKED: "cartButtonClicked",
            ADD_TO_CART: "AddToCart"
        },
        images: new WinJS.Binding.List(),
        product: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            var flipView = element.querySelector('#imageFlipView').winControl;
            flipView.itemTemplate = element.querySelector('#imageFlipViewTemplate');
            flipView.itemDataSource = this.images.dataSource;

            element.querySelector("#upper-cart").onclick = this._onCartButtonClick.bind(this);
            element.querySelector("#btnAddToCart").onclick = this._onAddToCart.bind(this);
            
        },
        clear: function() {
            this.product = null;
            this.images.splice(0, this.images.length);
            this.element.querySelector(".titlearea .pagetitle").textContent = "";
            this.element.querySelector("#product-price").textContent = "";
            this.element.querySelector(".short-description").innerHTML = "";
        },

        _onCartButtonClick: function () {
            this.dispatchEvent(this.events.CART_BUTTON_CLICKED);
        },

        _onAddToCart: function () {
            if(this.product) {
                this.dispatchEvent(this.events.ADD_TO_CART, { product: this.product, qty: "1" });
            }
            
        },
        /**
         * Sets the product name
         */
        setProductName: function(name) {
            this.element.querySelector(".titlearea .pagetitle").textContent = name;
        },

        /** 
         * Sets the product model
         */
        setProduct: function (product) {
            this.product = product;
            
            this.images.push(product);

            this.element.querySelector(".titlearea .pagetitle").textContent = product.displayName;
            this.element.querySelector("#product-price").textContent = window.toStaticHTML(product.pricing.formattedListPrice);
            this.element.querySelector(".content .short-description").innerHTML = window.toStaticHTML(product.shortDescription);

            this.showLoader(false);
        },

        showLoader: function (show) {
            var progress = this.element.querySelector("progress");
            
            if (show) {
                WinJS.Utilities.removeClass(progress, "hidden");
            } else {
                WinJS.Utilities.addClass(progress, "hidden");
            }
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
