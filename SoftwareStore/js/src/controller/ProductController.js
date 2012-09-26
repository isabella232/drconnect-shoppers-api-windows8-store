(function () {
    "use strict";
    /**
     * Product details page controller
     */
    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page, state) {
                page.setProductName(state.item.displayName);
                loadFullProduct(state.item.id).then(function (product) {
                    page.setProduct(product);
                });
            },

            
        }
    );

    // PRIVATE METHODS
    function loadFullProduct(id) {
        return DR.Store.Services.productService.getProduct(id);
    }
    
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        ProductController: Class
    });

})();