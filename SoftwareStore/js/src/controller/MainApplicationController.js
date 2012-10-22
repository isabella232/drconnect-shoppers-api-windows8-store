/**
 * Super Class for Controllers
 * most of Controller objects will inherit from this 
 */
(function () {
    "use strict";
    
    var Class = DR.MVC.BaseController.extend(
        function () {
            this._super();
            this._view = new DR.Store.View.MainApplicationView();
            this._view.initialize();
        },
        {   view: null,
            handle: function (detail) {
                WinJS.Utilities.eventMixin.addEventListener(this._view.events.CART_BUTTON_CLICKED, this._onCartButtonClicked.bind(this), false);
                WinJS.Utilities.eventMixin.addEventListener(this._view.events.HOME_BUTTON_CLICKED, this._onHomeButtonClicked.bind(this), false);

            },

            _onCartButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.CART_PAGE);
            },

            _onHomeButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.HOME_PAGE);
            }
        });
    // EXPOSING THE CLASS
    WinJS.Namespace.define("DR.Store.Controller", {
        MainApplicationController: Class
    });

})();