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
            productId: null,

            /**
             * Called when the product page is shown
             */
            initPage: function (page, state) {
                page.addEventListener(page.events.ITEM_SELECTED, this._onOfferItemSelected.bind(this), false);
                page.addEventListener(page.events.ADD_OFFER_CLICKED, this._onAddOfferToCartClicked.bind(this), false);

                this.productId = state.item.id;
                var self = this;
                page.setProductName(state.item.displayName);

                if (state.fullVersion) {
                    page.setProduct(state.item);
                    this.currentProductPromise = WinJS.Promise.wrap(state.item);
                } else {
                    // Loads the product and saves the promise to use it later on sharing
                  //  if (state.item.id === 250615900) state.item.id = 111111;
                    this.currentProductPromise = loadFullProduct(state.item.id);

                    this.currentProductPromise.then(function (product) {
                        page.setProduct(product);
                    }, function (error) {
                        console.log("ProductController: Error getting product detail: " + error.details.error.code + " - " + error.details.error.description);
                    });
                }

                this.getSpecialOffers(state.item.id);

                
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

            /**
             * Calls a service to get Special Offers for the Product
             */ 
            getSpecialOffers: function (productId) {
                var self = this;
                DR.Store.Services.productService.getOffersForProduct(productId).then(function (offers) {
                    console.debug("Offers For Product Retrieved Successfully");
                    self.page.setSpecialOffers(offers);
                    self.page.showOffers();
                }, function (error) {
                    self.page.hideOffers();
                    console.log("ProductController: Error retrieving special Offers: " + error.details.error.code + " - " + error.details.error.description);
                });
            },

            _onCartButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.CART_PAGE);
            },

            /**
             * Behaviour when adding a product to the cart
             */
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
            },

            /**
             * Default Behaviour when a product is clicked on the offers list
             */
            _onOfferItemSelected: function (e) {
                this.goToPage(DR.Store.URL.PRODUCT_PAGE, e.detail);
            },


            /**
             * Sends the notification for add the products selected on the offers list to the cart
             */
            _onAddOfferToCartClicked: function (e) {
                // Sets the timeStamp to verify if this controller has called addToCart when _onProductsAdded is called
                this._addToCartTimeStamp = new Date().getTime();
                e.detail.timeStamp = this._addToCartTimeStamp;

                this.notify(DR.Store.Notifications.ADD_PRODUCTS_TO_CART, e.detail);
            },

            /**
            * Called when a product has been successfully added to the cart
            */
            _onCartChanged: function (timeStamp) {
                // Compares the timeStamp of the event to determine if the addToCart event was sent by this controller. If so updates the views
                if (timeStamp && timeStamp === this._addToCartTimeStamp) {
                    this.page.clearSelection();
                    this._addToCartTimeStamp = null;
                    this.getSpecialOffers(this.productId);
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