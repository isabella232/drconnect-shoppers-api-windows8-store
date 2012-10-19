/**
 * Super Class for Controllers
 * most of Controller objects will inherit from this 
 */
(function () {
    "use strict";
    
    // TODO MUST BE PART OF THE CONFIG!
    var PAGE_SIZE = 5;

    var Class = DR.MVC.BaseController.extend(
        function () {
            this._super();
            this._view = new DR.Store.View.MainApplicationView();
            this._view.initialize();
        },
        {   view: null,
            handle: function (detail) {
                //this._view.addEventListener(this._view.events.CART_BUTTON_CLICKED, this._onCartButtonClicked.bind(this), false);
                WinJS.Utilities.eventMixin.addEventListener(this._view.events.CART_BUTTON_CLICKED, this._onCartButtonClicked.bind(this), false);
            },

            _onCartButtonClicked: function (e) {
                this.goToPage(DR.Store.URL.CART_PAGE);
            }
        });
    // EXPOSING THE CLASS
    WinJS.Namespace.define("DR.Store.Controller", {
        MainApplicationController: Class
    });

})();