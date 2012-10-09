// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/widgets/appbars/homeAppBar.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        events: {
            //CART_BUTTON_CLICKED: "cartButtonClicked",
        },
        ready: function (element, options) {
            // TODO: Initialize the page here.
            element.querySelector("#cmdAdd").addEventListener("click", this.clickAdd, false);
            //element.querySelector("#gotoCart").onclick = this._onCartButtonClick.bind(this);
        },

        clickAdd: function () {
            console.log("Add Clicked!");
        },

        /*_onCartButtonClick: function () {
            this.dispatchEvent(this.events.CART_BUTTON_CLICKED);
        },*/

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });
})();
