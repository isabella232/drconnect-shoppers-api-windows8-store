/**
 * This is the main controller of the application, handles all common functionalities, for example common buttons on all pages of the application
 */
(function () {
    "use strict";
    
    var Class = DR.MVC.BaseController.extend(
        function () {
            this._super();
            this._view = new DR.Store.View.MainApplicationView();
            this._view.initialize();
        },
        {   _view: null,
            handle: function (detail) {
                WinJS.Utilities.eventMixin.addEventListener(this._view.events.CART_BUTTON_CLICKED, this._onCartButtonClicked.bind(this), false);
                WinJS.Utilities.eventMixin.addEventListener(this._view.events.HOME_BUTTON_CLICKED, this._onHomeButtonClicked.bind(this), false);
                WinJS.Utilities.eventMixin.addEventListener(this._view.events.PROFILE_CLICKED, this._onProfileButtonClicked.bind(this), false);
            },

            /**
             * This function is called when a product/s is successfully added to the cart
             */
            handleCartChanged: function () {
                var self = this;
                DR.Store.Services.cartService.getItemsCount().then(function (count) {
                    self._view.animatePageHeaderCartIcon(count);
                }, function (error) {
                    console.log("MainApplicationController: Error retrieving cart item count: " + error.details.error.code + " - " + error.details.error.description);
                });
                
            },

            /**
             * Default behaviour when CART_BUTTON_CLICKED event is dispatched
             */
            _onCartButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.CART_PAGE);
            },

            /**
             * Default behaviour when HOME_BUTTON_CLICKED event is dispatched
             */
            _onHomeButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.HOME_PAGE);
            },

            _onProfileButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.SHOPPER_PAGE);
            },

            blockApp: function (message) {
                // Shows a Message on the UI
                if(message) this._view.showMessage(message);
                // Blocks the UI
                this._view.blockAppBar();
                DR.Store.App.navigationManager.getCurrentPageController().blockUI();

            },

            unBlockApp: function () {
                // Hides the message on the UI
                this._view.hideMessage();

                // Unblocks the UI
                this._view.unBlockAppBar();
                DR.Store.App.navigationManager.getCurrentPageController().unBlockUI();
            },

            showError: function (error) {
                DR.Store.App.navigationManager.getCurrentPageController().blockUI();
                this._view.showError(error);
            }


        });
    // EXPOSING THE CLASS
    WinJS.Namespace.define("DR.Store.Controller", {
        MainApplicationController: Class
    });

})();