// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/thanks/thanks.html", {
        events: {
            CONTINUE_CLICKED: "continueClicked"
        },
        ready: function (element, options) {
            // Get the continue shopping button
            var continueButton = this.element.querySelector("#continueShopping");
           // continueButton.onclick = this._onContinueClicked.bind(this);
        },

        _cart: null,

        setCart: function (cart) {
            this._cart = cart;

            this.element.querySelector("#orderNumber").textContent = cart.id;
        },

        /**
        * Behaviour when continue button is clicked
        */
        _onContinueClicked: function (e) {

            this.dispatchEvent(this.events.CONTINUE_CLICKED);
        },

        unload: function () {
            // When unloading change the setCart function in order to avoid failing if the callback returns
            this.setCart = function (cart) {
            };
        }

    });
})();
