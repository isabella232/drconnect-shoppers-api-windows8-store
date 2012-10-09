// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function (URI) {
    "use strict";

    function _buildWidget(URI) {
        var Class = WinJS.UI.Pages.define(URI, {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                // TODO: Initialize the page here.
            },

            unload: function () {
                // TODO: Respond to navigations away from this page.
            },

            updateLayout: function (element, viewState, lastViewState) {
                /// <param name="element" domElement="true" />

                // TODO: Respond to changes in viewState.
            }
        });
        return Class;
    }

    var _onProductClick = function () {
        console.log("Hola");
    };


    WinJS.Namespace.define("DR.Store.Widget", {
        ProductTemplate: _buildWidget("/widgets/templates/productTemplate.html"),
        CategoryTemplate: _buildWidget("/widgets/templates/categoryTemplate.html"),
        CartLineItemTemplate: _buildWidget("/widgets/templates/cartLineItemTemplate.html"),
        onProductClick: _onProductClick
    });
})();
