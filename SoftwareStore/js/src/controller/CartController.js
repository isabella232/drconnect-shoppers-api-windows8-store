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
                return DR.Store.Services.cartService.get().then(function (cart) {
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
                            self.notify(DR.Store.Notifications.PRODUCT_ADDED_TO_CART, timeStamp);
                            //self.goToPage(DR.Store.URL.CART_PAGE);
                        }
                    });
                }
            },

            _onCartItemSelected: function (e) {
                this.goToPage(DR.Store.URL.PRODUCT_PAGE, e.detail);
            }
        }
    );

    // PRIVATE METHODS
   
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        CartController: Class
    });

})();