// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    /**
     * Builds the widget corresponding to the html
     * @tamplateName: File name (without extension) inside /widgets/templates/ that contains the template
     */
    function _buildWidget(templateName) {
        var uri = "/widgets/templates/" + templateName + ".html";
        var Class = WinJS.UI.Pages.define(uri, {

        });
        return Class;
    }

    WinJS.Namespace.define("DR.Store.Widget", {
        ProductTemplate: _buildWidget("ProductTemplate"),
        CategoryTemplate: _buildWidget("CategoryTemplate"),
        CartLineItemTemplate: _buildWidget("CartLineItemTemplate"),
        CheckoutLineItemTemplate: _buildWidget("CheckoutLineItemTemplate"),
        AddressDetailTemplate: _buildWidget("AddressDetailTemplate"),
        PaymentOptionDetailTemplate: _buildWidget("PaymentOptionDetailTemplate")
    });
})();
