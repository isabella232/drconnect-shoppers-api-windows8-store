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
                page.addEventListener(page.events.CONTINUE_CLICKED, this._onContinue.bind(this), false);

                page.setCart(state);

            },

            /**
             * Default Behaviour when a continue button is clicked on the cart page
             */
            _onContinue: function (e) {
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