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
                page.addEventListener(page.events.CART_BUTTON_CLICKED, this._onCartButtonClicked.bind(this), false);
                page.addEventListener(page.events.ADD_TO_CART, this._onAddToCartClicked.bind(this), false);
            },

            _onCartButtonClicked: function(e) {
                this.goToPage(DR.Store.URL.CART_PAGE);
            },

            _onAddToCartClicked: function (e) {
                this.notify(DR.Store.Notifications.ADD_TO_CART, e.detail);
            }
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