// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/thanks/thanks.html", {
        events: {
            HOME_CLICKED: "homeClicked"
        },

        itemsList: null,
        _orderItems: null,

        ready: function (element, options) {

            this.itemsList = this.element.querySelector(".order-item-list").winControl;
            this.itemsList.itemTemplate = element.querySelector('#cartTemplate');
            this.itemsList.layout = new WinJS.UI.ListLayout();
            this._orderItems = new WinJS.Binding.List();
            this.itemsList.itemDataSource = this._orderItems.dataSource;

            // Get the continue shopping button
            var homeButton = this.element.querySelector(".dr-homebutton");
            homeButton.onclick = this._onHomeClicked.bind(this);

            this._initializeAppBars();
        },

        _order: null,

        /**
         * Sets the order to show on the view
         * @order the result of submitting the order
         * @cart  the submitted cart
         */
        setOrder: function (order, cart) {
            this._order = order;
            this.element.querySelector("#orderNumber").textContent = order.order.id;
            this.element.querySelector("#orderTotal").textContent = order.pricing.formattedOrderTotal;

            this._setOrderItems(this._mergeItems(order.lineItems.lineItem, cart.lineItems.lineItem));

            this.element.querySelector("#summary").winControl.renderPricing(this._adaptPricingModel(order.pricing));

            this._renderShippingAddress(cart.shippingAddress);
            
        },

        /**
         * Merge the order and the cart LineItems in order to get a complete information
         */
        _mergeItems: function (orderLineItems, cartLineItems) {
            var self = this;
            var lineItems = [];
            var lineItem;
            var cartLineItem
            orderLineItems.forEach(function (orderLineItem) {
                lineItem = orderLineItem;
                cartLineItem = self._getLineItemById(cartLineItems, lineItem.id);
                lineItem.product = cartLineItem.product;
                lineItems.push(lineItem);
            });
            return lineItems;
        },

        /**
         * Gets the lineItem from the lineItemsList that matches with the id
         */
        _getLineItemById: function (lineItems, id) {
            var lineItem = null;
            for(var i=0; i < lineItems.length; i++){
                lineItem = lineItems[i];
                if (lineItem.id === id) {
                    break;
                }
            };
            return lineItem;
        },


        /*
         * Since order.pricing is different from cart.pricing, adapt the model for being used in the cartSummaryWidget then
         */
        _adaptPricingModel: function(pricing){
            pricing.formattedOrderTotal = pricing.formattedTotal;
            pricing.formattedShippingAndHandling = pricing.formattedShipping;
            return pricing;

        },


        /**
        * Sets the order items
        */
        _setOrderItems: function (items) {
            var self = this;
            items.forEach(function (item) {
                self._orderItems.push(item);
            });
        },

        _renderShippingAddress: function(shippingAddress){
            var detailTemplate = this.element.querySelector("#addressDetailTemplate").winControl;
            var detailElement = this.element.querySelector(".shipping-address-tile");
            detailTemplate.render(shippingAddress, detailElement);
        },

        /**
       * Initializes the application bars
       */
        _initializeAppBars: function () {

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.hideCommands(["gotoCart"]);
            this.bottomAppBar.setVisible(false);

            this.topAppBar = DR.Store.App.AppTopBar.winControl;

            // Because this page is the cart page, hides the gotoCart button on the page header bar
            var pageHeaderBar = DR.Store.App.PageHeaderBar.winControl;
            pageHeaderBar.hideElement("#upper-cart");


        },

        /**
        * Behaviour when continue button is clicked
        */
        _onHomeClicked: function (e) {
            this.dispatchEvent(this.events.HOME_CLICKED);
        },

        unload: function () {
            // When unloading change the setCart function in order to avoid failing if the callback returns
            this.setOrder = function (order) {
            };

        }

    });
})();
