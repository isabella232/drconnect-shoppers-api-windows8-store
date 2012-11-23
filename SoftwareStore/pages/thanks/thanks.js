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

            //this.itemsList.oniteminvoked = this._onCartItemClicked.bind(this);
            //this.itemsList.addEventListener("selectionchanged", this._itemSelected.bind(this));

            // Get the continue shopping button
            var homeButton = this.element.querySelector(".dr-homebutton");
            homeButton.onclick = this._onHomeClicked.bind(this);
        },

        _order: null,

        /**
         * Sets the order to show on the view
         */
        setOrder: function (order) {
            this._order = order;
            this.element.querySelector("#orderDate").textContent = order.submissionDate;
            this.element.querySelector("#orderNumber").textContent = order.id;
            this.element.querySelector("#orderTotal").textContent = order.pricing.formattedTotal;

            this._setOrderItems(order.lineItems.lineItem);

            this.element.querySelector("#order-fees").textContent = order.pricing.formattedIncentive + "?";
            this.element.querySelector("#order-tax").textContent = order.pricing.formattedTax;
            if (order.pricing.formattedShipping) {
                this.element.querySelector("#order-shipping").textContent = order.pricing.formattedShipping;
            } else {
                this.element.querySelector("#order-shipping").textContent = "$0.00";
            }
            this.element.querySelector("#order-total").textContent = order.pricing.formattedTotal;

            this._renderShippingAddress(order.shippingAddress);
            
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

        blockHomeButton: function(){
            this.element.querySelector(".dr-homebutton").disabled=true;
        },

        unBlockHomeButton: function(){
            this.element.querySelector(".dr-homebutton").disabled=false;
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
