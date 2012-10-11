// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/product/product.html", {
        events: {
            CART_BUTTON_CLICKED: "cartButtonClicked",
            ADD_TO_CART: "AddToCart",
            DETAILS_TAB_CLICK: "detailsTabClick",
            OVERVIEW_TAB_CLICK: "overviewTabClick"
        },
        images: new WinJS.Binding.List(),
        product: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var oSelf = this;

            // TODO: Initialize the page here.
            var flipView = element.querySelector('#imageFlipView').winControl;
            flipView.itemTemplate = element.querySelector('#imageFlipViewTemplate');
            flipView.itemDataSource = this.images.dataSource;

            element.querySelector("#upper-cart").onclick = oSelf._onCartButtonClick.bind(oSelf);
            element.querySelector("#btnAddToCart").onclick = oSelf._onAddToCart.bind(oSelf);

            element.querySelector("#overviewTab").addEventListener("click", function (e) {
                oSelf.toggleProductTab.call(oSelf, e, { activeTab: 'overview' });
                return false; // cancel bubble;
            });

            element.querySelector("#detailsTab").addEventListener("click", function (e) {
                oSelf.toggleProductTab.call(oSelf, e, { activeTab: 'details' });
                return false;
            });
            
        },
        clear: function() {
            this.product = null;
            this.images.splice(0, this.images.length);
            this.element.querySelector(".titlearea .pagetitle").textContent = "";
            this.element.querySelector("#product-price").textContent = "";
            this.element.querySelector(".short-description").innerHTML = "";
            this.element.querySelector(".long-description").innerHTML = "";
        },

        _onCartButtonClick: function () {
            this.dispatchEvent(this.events.CART_BUTTON_CLICKED);
        },

        _onAddToCart: function () {
            if(this.product) {
                this.dispatchEvent(this.events.ADD_TO_CART, { product: this.product, qty: "1" });
            }
            
        },

        toggleProductTab: function (e, tabOptions) {
            var target = e.target;
            var oSelf = this;

            if (target.className.indexOf('selected' === -1)) {
                // unselect all of the tab buttons
                WinJS.Utilities.query(".display-pane-header button", oSelf.element).forEach(function (el, i) {
                    WinJS.Utilities.removeClass(el, 'selected');
                });

                // add the selected class name to the tab that was clicked 
                WinJS.Utilities.addClass(target, 'selected');

                switch(tabOptions.activeTab) {
                    case 'details':
                        // broadcast the event
                        oSelf.dispatchEvent(oSelf.events.OVERVIEW_TAB_CLICK);
                        oSelf._toggleOverviewTab(false); // hide the overview tab
                        oSelf._toggleDetailsTab(true);   // show the details tab
                        break;
                    case 'overview':
                        // fall through to make this the default behavior

                    default:
                        oSelf.dispatchEvent(oSelf.events.DETAILS_TAB_CLICK);
                        oSelf._toggleDetailsTab(false);      // hide the details tab
                        oSelf._toggleOverviewTab(true);    // show the overview tab
                        break;
                }
            }
        },

        _toggleOverviewTab: function (vis) {
            // broadcast the event
            var tab = this.element.querySelector('#overview_pane');
            if (tab) {
                if (typeof vis === 'undefined') {
                    vis = !tab.style.display === 'none';
                }
                tab.style.display = (vis ? 'block' : 'none');
            }
        },

        _toggleDetailsTab: function (vis) {
            var tab = this.element.querySelector('#details_pane');
            if (tab) {
                if (typeof vis === 'undefined') {
                    vis = !tab.style.display === 'none';
                }
                tab.style.display = (vis ? 'block' : 'none');
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
            this.element.querySelector(".content .short-description").innerHTML = window.toStaticHTML(product.shortDescription || "");
            this.element.querySelector(".content .long-description").innerHTML = window.toStaticHTML(product.longDescription || "");

            this.showLoader(false);
        },

        showLoader: function (show) {
            var progress = this.element.querySelector("progress");
            if (!progress) return;
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
