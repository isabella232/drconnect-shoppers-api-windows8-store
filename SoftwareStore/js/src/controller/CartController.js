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
                page.addEventListener(page.events.ADD_OFFER_CLICKED, this._onAddOfferToCartClicked.bind(this), false);
                page.addEventListener(page.events.APPLY_PROMO_CODE_CLICKED, this._onApplyPromoCode.bind(this), false);
                return this._getCart();
            },

            /**
             * Get the cart calling the service and set it to the view
             */
            _getCart: function () {
                var self = this;

                DR.Store.Services.cartService.getCandyRackProducts().then(function (candyRack) {
                    self.page.setCandyRack(candyRack.productOffer);
                }, function (error) {
                    self.page.hideCandyRack();
                    console.log("CartController: Error Retrieving candy rack: " + error.details.error.code + " - " + error.details.error.description);
                });

                return DR.Store.Services.cartService.get().then(function (cart) {
                    self.page.setCart(cart);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
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
                var timeStamp = args.timeStamp;
                // Send notification to block the application
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.addProduct").value);
                DR.Store.Services.cartService.addToCart(args.product, args.qty, args.addToCartUri)
                .then(function (data) {
                    // I the remove from cart was not fired by this controller it unblocks the app, otherwise CART_CHANGED notification will do it later
                    if (!self._cartChangeTimeStamp || self._cartChangeTimeStamp != timeStamp) {
                        self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    }
                    console.log("Sending add product finished notification");
                    self.notify(DR.Store.Notifications.CART_CHANGED);
                }, function (error) {
                    console.log("CartController: Error Adding product to the cart: " + error.details.error.code + " - " + error.details.error.description);
                });
            },


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
                var timeStamp = productsList.timeStamp;
                if (productsList.length > 0) {
                    DR.Store.Services.cartService.addMultipleProductsToCart(productsList).then(function (data) {
                        // If the add to cart was not fired by this controller it unblocks the app, otherwise CART_CHANGED notification will do it later
                        if (!self._cartChangeTimeStamp || self._cartChangeTimeStamp != timeStamp) {
                            self.notify(DR.Store.Notifications.UNBLOCK_APP);
                        }
                        // Sends the timeStamp on the notification so the each controller can recognize if the AddToCart notification was send by self
                        console.log("Sending add product finished notification");
                        self.notify(DR.Store.Notifications.CART_CHANGED, timeStamp);
                    }, function (error) {
                        console.log("CartController: Error Adding product to the cart: " + error.details.error.code + " - " + error.details.error.description);
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
                DR.Store.Services.cartService.removeMultipleLineItemsFromCart(lineItems).then(function () {
                    console.log("Sending remove products finished notification");
                    // I the remove from cart was not fired by this controller it unblocks the app, otherwise CART_CHANGED notification will do it later
                    if (!self._cartChangeTimeStamp || self._cartChangeTimeStamp != timeStamp) {
                        self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    }
                    // Since remove from cart is called from this controller Unblocks the application with the cartChanged
                    self.notify(DR.Store.Notifications.CART_CHANGED, timeStamp);

                }, function (error) {
                    var errorItem = error[0];
                    console.log("CartController: Error Removing lineitems from the cart: " + errorItem.details.error.code + " - " + errorItem.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                });
            },




            /**
              * Handles remove from cart notifications
              * @args the item to be removed
              * Once all requests are completed sends a CART_CHANGED notification so other controllers can update the corresponding views
              */
            /*removeFromCart: function (lineItems) {
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
                WinJS.Promise.join(promises).then(function () {
                    console.log("Sending add product finished notification");
                    // I the remove from cart was not fired by this controller it unblocks the app, otherwise CART_CHANGED notification will do it later
                    if (!self._cartChangeTimeStamp || self._cartChangeTimeStamp != timeStamp) {
                        self.notify(DR.Store.Notifications.UNBLOCK_APP);
                    }
                    // Since remove from cart is called from this controller Unblocks the application with the cartChanged
                    self.notify(DR.Store.Notifications.CART_CHANGED, timeStamp);

                }, function (error) {
                    var errorItem = error[0];
                    console.log("CartController: Error Removing a line item from the cart: " + errorItem.details.error.code + " - " + errorItem.details.error.description);
                });
            },*/

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
                    // Once the item has been edited it gets the shopping cart again because a the cart Totals has been changed and the editLineItem only returns
                    // the lineItem
                    console.log("Sending cart changed notification");
                    // Since editQuantity cart is called from this controller Unblocks the application with the cartChanged
                    self.notify(DR.Store.Notifications.CART_CHANGED, self._cartChangeTimeStamp);
                }, function (error) {
                    console.log("CartController: Error editing a line item from the cart: " + error.details.error.code + " - " + error.details.error.description);
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
             * Sends the notification for add the products selected for the cart
             */
            _onAddOfferToCartClicked: function (e) {
                // Sets the timeStamp to verify if this controller has called addToCart when _onProductsAdded is called
                this._cartChangeTimeStamp = new Date().getTime();
                e.detail.timeStamp = this._cartChangeTimeStamp;

                this.notify(DR.Store.Notifications.ADD_PRODUCTS_TO_CART, e.detail);
            },


            /**
             * Calls the service when a promo code needs to be applied
             */
            _onApplyPromoCode: function (e) {
                var self = this;
                self.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.applyPromoCode").value);
                DR.Store.Services.cartService.applyPromoCode(e.promoCode).then(function (cart) {
                    self.page.clearPromoCodeField();
                    self.page.setCart(cart);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                }, function (error) {
                    console.log("CartController: Error applying promo code to the cart: " + error.details.error.code + " - " + error.details.error.description);
                    self.notify(DR.Store.Notifications.UNBLOCK_APP);
                });
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