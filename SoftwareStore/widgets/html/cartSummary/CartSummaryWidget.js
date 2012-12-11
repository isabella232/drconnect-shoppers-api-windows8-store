// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    /**
     * This class is a widget responsible for rendering the summary totals on the cart
     */ 
    var Class = WinJS.UI.Pages.define("/widgets/html/cartSummary/CartSummaryWidget.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            this._hideOptionalFields();
        },

        /**
         * Renders the values on the widget
         */
        renderPricing: function (pricing) {
            this.element.querySelector("#cart-tax").textContent = pricing.formattedTax;
            this.element.querySelector("#cart-total").textContent = pricing.formattedOrderTotal;


            // Hides the Fees if its 0 or null
            if (pricing.formattedIncentive && pricing.formattedIncentive != "$0.00") {
                WinJS.Utilities.removeClass(this.element.querySelector("#feesLabel"), "hidden");
                WinJS.Utilities.removeClass(this.element.querySelector("#order-fees"), "hidden");
                this.element.querySelector("#order-fees").textContent = pricing.formattedIncentive + "?";
            } else {
                WinJS.Utilities.addClass(this.element.querySelector("#feesLabel"), "hidden");
                WinJS.Utilities.addClass(this.element.querySelector("#order-fees"), "hidden");
            }

            // Hides the Shipping if its 0 or null
            if (pricing.formattedShippingAndHandling && pricing.formattedShippingAndHandling != "$0.00") {
                WinJS.Utilities.removeClass(this.element.querySelector("#shippingLabel"), "hidden");
                WinJS.Utilities.removeClass(this.element.querySelector("#cart-shipping"), "hidden");
                this.element.querySelector("#cart-shipping").textContent = pricing.formattedShippingAndHandling;
            } else {
                WinJS.Utilities.addClass(this.element.querySelector("#shippingLabel"), "hidden");
                WinJS.Utilities.addClass(this.element.querySelector("#cart-shipping"), "hidden");
            }

            // Hides the Discount if its 0 or null
            if (pricing.formattedDiscount && pricing.formattedDiscount != "$0.00") {
                WinJS.Utilities.removeClass(this.element.querySelector("#discountLabel"), "hidden");
                WinJS.Utilities.removeClass(this.element.querySelector("#cart-discount"), "hidden");
                WinJS.Utilities.removeClass(this.element.querySelector("#oldPriceLabel"), "hidden");
                WinJS.Utilities.removeClass(this.element.querySelector("#oldPrice"), "hidden");
                this.element.querySelector("#cart-discount").textContent = pricing.formattedDiscount;
                this.element.querySelector("#oldPrice").textContent = pricing.formattedSubtotal;
                this.element.querySelector("#cart-subtotal").textContent ="$" +  (pricing.subtotal.value - pricing.discount.value).toFixed(2);
            } else {
                this.element.querySelector("#cart-subtotal").textContent = pricing.formattedSubtotal;
                WinJS.Utilities.addClass(this.element.querySelector("#discountLabel"), "hidden");
                WinJS.Utilities.addClass(this.element.querySelector("#cart-discount"), "hidden");
                WinJS.Utilities.addClass(this.element.querySelector("#oldPriceLabel"), "hidden");
                WinJS.Utilities.addClass(this.element.querySelector("#oldPrice"), "hidden");
            }
        },
        
        /** 
         * Clears the value of all fields
         */
        clear: function () {

            this.element.querySelector("#cart-subtotal").textContent = "";
            this.element.querySelector("#cart-tax").textContent = "";
            this.element.querySelector("#cart-discount").textContent = "";
            this.element.querySelector("#cart-total").textContent = "";
            this.element.querySelector("#cart-shipping").textContent = "";
            this.element.querySelector("#order-fees").textContent = "";

            this._hideOptionalFields();
        },

        /**
         * Hides the fields that are optional. Depends on the value for being shown or not
         */
        _hideOptionalFields: function () {

            WinJS.Utilities.addClass(this.element.querySelector("#shippingLabel"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("#cart-shipping"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("#discountLabel"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("#cart-discount"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("#feesLabel"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("#order-fees"), "hidden");

        }

       
    });

    WinJS.Namespace.define("DR.Store.Widget.Html", {
        CartSummaryWidget: Class
    });
})();
