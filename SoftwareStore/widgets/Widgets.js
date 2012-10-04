(function () {

    function create() {
        var Class = WinJS.UI.Pages.define("/widgets/productTemplate/productTemplate.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {},

            unload: function () {},

            updateLayout: function (element, viewState, lastViewState) {}
        });
        return Class;
    }

    WinJS.Namespace.define("DR.Store.Widget", {
        ProductTemplate: create("productTemplate"),
        CategoryTemplate: create("categoryTemplate")
    });
})();