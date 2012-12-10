/** 
 * Controller that handles user authentication
 */
(function () {
    "use strict";

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            /**
             * Loads the data and passes it to the page on initialization
             */
            initPage: function (page, state) {
                page.addEventListener(page.events.ITEM_SELECTED, this._onItemSelected.bind(this), false);
                page.addEventListener(page.events.ADD_OFFER_CLICKED, this._onAddOfferToCartClicked.bind(this), false);
                page.setOffer(state.item);

            },

            /**
             * Default Behaviour when a product is clicked on the cart page
             */
            _onItemSelected: function (e) {
                this.goToPage(DR.Store.URL.PRODUCT_PAGE, e.detail);
            },

            /**
             * Sends the notification for add the products selected for the cart
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
                }
            }
           
        }
        );

    WinJS.Namespace.define("DR.Store.Controller", {
        OfferController: Class
    });

})();