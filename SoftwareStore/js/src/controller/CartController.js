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
            _cartChangeTimeStamp: null,

            initPage: function (page, state) {
                page.addEventListener(page.events.ITEM_SELECTED, this._onCartItemSelected.bind(this), false);
                page.addEventListener(page.events.CHECKOUT_CLICKED, this._onCheckout.bind(this), false);
                page.addEventListener(page.events.LINE_ITEM_QUANTITY_CHANGED, this._onEditQuantity.bind(this), false);
                page.addEventListener(page.events.REMOVE_ITEM_CLICKED, this._onRemoveFromCartClicked.bind(this), false);
                page.addEventListener(page.events.RESET_CART_CLICKED, this._onRemoveFromCartClicked.bind(this), false);
                return this._getCart();
            },

            /**
             * Get the cart calling the service and set it to the view
             */
            _getCart: function () {
                var self = this;
                return DR.Store.Services.cartService.get().then(function (cart) {
                    self.page.setCart(cart);
                }, function (error) {
                    console.log("CartController: Error Retrieving cart: " + error.details.error.code + " - " + error.details.error.description);
                });
            },

            /**
             * Handles AddToCart notifications
             * @args the product to add 
             * Once all requests are completed sends a CART_CHANGED notification so other controllers can update the corresponding views
             */
            addToCart: function (args) {
                var self = this;
                // Send notification to block the application
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.addProduct").value);
                DR.Store.Services.cartService.addToCart(args.product, args.qty, args.addToCartUri)
                .then(function (data) {
                    console.log("Sending add product finished notification");
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    self.notify(DR.Store.Notifications.CART_CHANGED);
                   // self.goToPage(DR.Store.URL.CART_PAGE);
                }, function (error) {
                    console.log("CartController: Error Adding product to the cart: " + error.details.error.code + " - " + error.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
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
             * Once all requests are completed sends a CART_CHANGED notification so other controllers can update the corresponding views
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
                    // If it is the first product that will be added send the block app notification
                    if (!this.addingFlag) {
                        // Send notification to block the application
                        self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.addProduct").value);
                    }
                    DR.Store.Services.cartService.addToCart(productToAdd.product, 1, productToAdd.addToCartUri).then(function (data) {
                        if (productsList.length > 0) {
                            self.addProductsToCart(productsList);
                        } else {
                            var timeStamp = productsList.timeStamp;
                            // Sends the timeStamp on the notification so the each controller can recognize if the AddToCart notification was send by self
                            console.log("Sending add product finished notification");
                            self.notify(DR.Store.Notifications.UNBLOCK_APP);
                            self.notify(DR.Store.Notifications.CART_CHANGED, timeStamp);
                        }
                    }, function (error) {
                        console.log("CartController: Error Adding product to the cart: " + error.details.error.code + " - " + error.details.error.description);
                        self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    });
                }
            },

            /**
              * Handles remove from cart notifications
              * @args the item to be removed
              * Once all requests are completed sends a CART_CHANGED notification so other controllers can update the corresponding views
              */
            removeFromCart: function (lineItems) {
                var self = this;
                var promises = [];
                var timeStamp = lineItems.timeStamp;
                if (lineItems.length > 0) {
                    // Send notification to block the application
                    self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.removeProduct").value);
                }
                lineItems.forEach(function (lineItem) {
                    promises.push(DR.Store.Services.cartService.removeLineItemFromCart(lineItem));
                });
                WinJS.Promise.join(promises).then(function (data) {
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    console.log("Sending add product finished notification");
                    self.notify(DR.Store.Notifications.CART_CHANGED, timeStamp);
                }, function (error) {
                    var errorItem = error[0];
                    console.log("CartController: Error Removing a line item from the cart: " + errorItem.details.error.code + " - " + errorItem.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                });
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
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.editQuantity").value);
                // Call the service to edit the line Item quantity
                this._cartChangeTimeStamp = new Date().getTime();
                DR.Store.Services.cartService.editLineItem(e.item.data, e.quantity).then(function (data) {
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    // Once the item has been edited it gets the shopping cart again because a the cart Totals has been changed and the editLineItem only returns
                    // the lineItem
                    console.log("Sending cart changed notification");
                    self.notify(DR.Store.Notifications.CART_CHANGED, self._cartChangeTimeStamp);
                }, function (error) {
                    console.log("CartController: Error editing a line item from the cart: " + error.details.error.code + " - " + error.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                });

            },

            /**
             * Called when removefromcart or reset cart is clicked
             */
            _onRemoveFromCartClicked: function (e) {
                this._cartChangeTimeStamp = new Date().getTime();
                e.detail.timeStamp = this._cartChangeTimeStamp;
                this.notify(DR.Store.Notifications.REMOVE_FROM_CART, e.detail);
            },


            /**
             * Default Behaviour when a checkout button is clicked on the cart page
             */
            _onCheckout: function (e) {
                this.goToPage(DR.Store.URL.CHECKOUT_PAGE);
            },

            /**
             * Called when a product has been successfully added to the cart
             */
            _onCartChanged: function (timeStamp) {
                // Compares the timeStamp of the event to determine if the addToCart event was sent by this controller. If so updates the views
                if (timeStamp && timeStamp === this._cartChangeTimeStamp) {
                    this.page.clearSelection();
                    // Refreshes the cart
                    this._getCart();
                    this._cartChangeTimeStamp = null;
                }
            }


        }
    );

    // PRIVATE METHODS
   
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        CartController: Class
    });

})();