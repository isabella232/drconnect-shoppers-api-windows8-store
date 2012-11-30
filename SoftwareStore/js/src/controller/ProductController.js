/**
 * Product details page controller
 */
(function () {
    "use strict";
    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            currentProductPromise: null,

            /**
             * Called when the product page is shown
             */
            initPage: function (page, state) {
                var self = this;
                page.setProductName(state.item.displayName);

                if (state.fullVersion) {
                    page.setProduct(state.item);
                    this.currentProductPromise = WinJS.Promise.wrap(state.item);
                } else {
                    // Loads the product and saves the promise to use it later on sharing
                    this.currentProductPromise = loadFullProduct(state.item.id);

                    this.currentProductPromise.then(function (product) {
                        page.setProduct(product);
                    }, function (error) {
                        console.log("ProductController: Error getting product detail: " + error.details.error.code + " - " + error.details.error.description);
                    });
                }
                page.addEventListener(page.events.CART_BUTTON_CLICKED, this._onCartButtonClicked.bind(this), false);
                page.addEventListener(page.events.ADD_TO_CART, this._onAddToCartClicked.bind(this), false);
            },

            /**
             * Sharing handler.
             * Called when the user wants to share the product
             * Returns a promise that will be complete when the loading of the product is complete. Only then the product is shared
             */
            share: function (sharing) {
                if (this.currentProductPromise) {
                    
                    return this.currentProductPromise.then(function (product) {
                        sharing.setBasicInfo(product.displayName);
                        sharing.setText(product.shortDescription || product.displayName);

                        if (product.longDescription) {
                            sharing.setHTML(product.longDescription);
                        }

                        if (product.productImage) {
                            sharing.setImage(product.productImage);
                        }
                    });
                }
            },

            _onCartButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.CART_PAGE);
            },

            _onAddToCartClicked: function (e) {
                var unsnapped = true;
                var oSelf = this;

                // Check to see if the application is in snapped view.
                if (appView.value === appViewState.snapped) {
                    unsnapped = Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
                }
                if (unsnapped) {
                    setTimeout(function () {
                        oSelf.notify(DR.Store.Notifications.ADD_TO_CART, e.detail);
                    }, 0);
                }
            }
        }
    );

    // PRIVATE METHODS
    function loadFullProduct(id) {
        return DR.Store.Services.productService.getProduct(id);
    }
    
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        ProductController: Class
    });

})();