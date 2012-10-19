// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    function _buildHtmlControl(controlFileName) {
        var uri = "/widgets/html/" + controlFileName + ".html";
        var Class = WinJS.UI.Pages.define(uri, {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {

            }

        });
        return Class;
    }

    WinJS.Namespace.define("DR.Store.Widget.Html", {
        Footer: _buildHtmlControl("Footer"),
        DefaultAppBar: _buildHtmlControl("DefaultAppBar")
    });

})();
