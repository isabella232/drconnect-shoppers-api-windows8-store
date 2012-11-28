(function () {
    "use strict";
    /**
     * Cart page controller
     */
    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page, state) {
                // Adds a listener for the submit cart button
                page.addEventListener(page.events.HOME_CLICKED, this._onHomeClicked.bind(this), false);
                
                this.page.setOrder(state.order, state.cart);

            },

            /**
             * Default Behaviour when a home button is clicked on the cart page
             */
            _onHomeClicked: function (e) {
                this.goToPage(DR.Store.URL.HOME_PAGE);
            }

        }
    );

    // PRIVATE METHODS
   
    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        ThanksController: Class
    });

})();