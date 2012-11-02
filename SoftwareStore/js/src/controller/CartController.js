(function () {
    "use strict";
    /**
     * Cart page controller
     */
    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page, state) {
                page.addEventListener(page.events.ITEM_SELECTED, this._onCartItemSelected.bind(this), false);
                page.addEventListener(page.events.CHECKOUT_CLICKED, this._onCheckout.bind(this), false);
                page.addEventListener(page.events.LINE_ITEM_QUANTITY_CHANGED, this._onEditQuantity.bind(this), false);
                return DR.Store.Services.cartService.get().then(function (cart) {
                    if (cart.lineItems.lineItem && cart.lineItems.lineItem.length > 0) {
                        page.showCheckoutButton();
                    } else {
                        page.hideCheckoutButton();
                    }
                    page.setCart(cart);
                });
            },

            /**
             * Handles AddToCart notifications
             * @args the product to add 
             * Once all requests are completed sends a PRODUCT_ADDED_TO_CART notification so other controllers can update the corresponding views
             */
            addToCart: function (args) {
                var self = this;
                DR.Store.Services.cartService.addToCart(args.product, args.qty, args.addToCartUri)
                .then(function (data) {
                    console.log("Sending add product finished notification");
                    self.notify(DR.Store.Notifications.PRODUCT_ADDED_TO_CART);
                   // self.goToPage(DR.Store.URL.CART_PAGE);
                });
            },

            /*addProductsToCart: function (args) {
                var self = this;
                var promises = [];
                args.forEach(function (productToAdd) {
                    promises.push(DR.Store.Services.cartService.addToCart(productToAdd.product, 1, productToAdd.addToCartUri));
                });
                console.log(args.length);

                WinJS.Promise.join(promises).then(function (data) {
                    self.goToPage(DR.Store.URL.CART_PAGE);
                });
            },*/

            /**
             * Receive a list and adds multiple products sequentially (waits for the response before calling add for the next product)
             * Once all requests are completed sends a PRODUCT_ADDED_TO_CART notification so other controllers can update the corresponding views
             * @productsList list of products to add
             * TODO: Change this logic to add all products simultaneously, the API has a bug when calling addToCart concurrently, this is because 
             * the requests are called sequentially
             */
            addProductsToCart: function (productsList) {
                var self = this;
                var list = [];
                var productToAdd;
                if (productsList.length > 0) {
                    productToAdd = productsList.splice(0, 1)[0];
                    DR.Store.Services.cartService.addToCart(productToAdd.product, 1, productToAdd.addToCartUri).then(function (data) {
                        if (productsList.length > 0) {
                            self.addProductsToCart(productsList);
                        } else {
                            var timeStamp = productsList.timeStamp;
                            // Sends the timeStamp on the notification so the each controller can recognize if the AddToCart notification was send by self
                            console.log("Sending add product finished notification");
                            self.notify(DR.Store.Notifications.PRODUCT_ADDED_TO_CART, timeStamp);
                            //self.goToPage(DR.Store.URL.CART_PAGE);
                        }
                    });
                }
            },

            /**
             * Default Behaviour when a product is clicked on the cart page
             */
            _onCartItemSelected: function (e) {
                this.goToPage(DR.Store.URL.PRODUCT_PAGE, e.detail);
            },

            /**
             * Behaviour when a cartItem quantity has changed
             */
            _onEditQuantity: function (e) {
                var self = this;
                // Call the service to edit the line Item quantity
                DR.Store.Services.cartService.editLineItem(e.item.data, e.quantity).then(function (data) {
                    // Once the item has been edited it gets the shopping cart again because a the cart Totals has been changed and the editLineItem only returns
                    // the lineItem
                    DR.Store.Services.cartService.get().then(function (cart) {
                        // Sets the cart in order to update the view
                        self.page.setCart(cart);
                    });
                });

            },


            /**
             * Default Behaviour when a checkout button is clicked on the cart page
             */
            _onCheckout: function (e) {
                this.goToPage(DR.Store.URL.CHECKOUT_PAGE);
            }
        }
    );

    // PRIVATE METHODS
   
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        CartController: Class
    });

})();