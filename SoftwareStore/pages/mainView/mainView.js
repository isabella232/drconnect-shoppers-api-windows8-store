(function () {
    "use strict";

    var Class = DR.Class.extend(
        function (config, implementation) {
        },
        {
            events: {
                CART_BUTTON_CLICKED: "cartButtonClicked",
                HOME_BUTTON_CLICKED: "homeButtonClicked"
            },

            initialize: function () {
                var cartButtonLabel = WinJS.Resources.getString('general.button.cart.label').value;
                var cartButtonTooltip = WinJS.Resources.getString('general.button.cart.tooltip').value;
                var homeButtonLabel = WinJS.Resources.getString('general.button.home.label').value;
                var homeButtonTooltip = WinJS.Resources.getString('general.button.home.tooltip').value;
                var profileButtonLabel = WinJS.Resources.getString('general.button.profile.label').value;
                var profileButtonTooltip = WinJS.Resources.getString('general.button.profile.tooltip').value;

                this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
                this.bottomAppBar.addDefaultCommand({ id: 'gotoCart', label: cartButtonLabel, icon: '', section: 'global', tooltip: cartButtonTooltip, clickHandler: this._onCartButtonClick.bind(this) });

                // Initialize the top AppBar
                this.topAppBar = DR.Store.App.AppTopBar.winControl;
                this.topAppBar.addDefaultCommands(
                    [{ id: 'home', label: homeButtonLabel, icon: '', section: 'global', tooltip: homeButtonTooltip, clickHandler: this._onHomeButtonClick.bind(this) },
                     { id: 'profile', label: profileButtonLabel, icon: '', section: 'global', tooltip: profileButtonTooltip }]);



                // TODO: Intialize the PageHeaderBar (add Buttons and event listeners)
                





            },

            dispatchEvent : function(event, data){
                WinJS.Utilities.eventMixin.dispatchEvent(event, data);
            },

            _onCartButtonClick: function () {
                this.dispatchEvent(this.events.CART_BUTTON_CLICKED);
            },

            _onHomeButtonClick: function () {
                this.dispatchEvent(this.events.HOME_BUTTON_CLICKED);
            }

        });

    WinJS.Namespace.define("DR.Store.View", {
        MainApplicationView: Class
    });

})();