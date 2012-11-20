(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    var Class = DR.Class.extend(
        function (config, implementation) {
        },
        {
            events: {
                CART_BUTTON_CLICKED: "cartButtonClicked",
                HOME_BUTTON_CLICKED: "homeButtonClicked",
                PROFILE_CLICKED: "profileClicked"
            },

            /**
             * Bottom Application Bar
             */
            bottomAppBar: null,
            /**
             * Top Application Bar
             */
            topAppBar: null,
            /**
             * Page Header Bar
             */
            pageHeaderBar: null,

            /**
             * Initializes the view adding default buttons to the application bars, and pageHeaderBar and click handlers
             */
            initialize: function () {

                // Get the localized messages
                var cartButtonLabel = WinJS.Resources.getString('general.button.cart.label').value;
                var cartButtonTooltip = WinJS.Resources.getString('general.button.cart.tooltip').value;
                var homeButtonLabel = WinJS.Resources.getString('general.button.home.label').value;
                var homeButtonTooltip = WinJS.Resources.getString('general.button.home.tooltip').value;
                var profileButtonLabel = WinJS.Resources.getString('general.button.profile.label').value;
                var profileButtonTooltip = WinJS.Resources.getString('general.button.profile.tooltip').value;

                // Initialize the bottom AppBar
                this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
                this.bottomAppBar.addDefaultCommand({ id: 'gotoCart', label: cartButtonLabel, icon: '', section: 'global', tooltip: cartButtonTooltip, clickHandler: this._onCartButtonClick.bind(this) });

                // Initialize the top AppBar
                this.topAppBar = DR.Store.App.AppTopBar.winControl;
                this.topAppBar.addDefaultCommands(
                    [{ id: 'home', label: homeButtonLabel, icon: '', section: 'global', tooltip: homeButtonTooltip, clickHandler: this._onHomeButtonClick.bind(this) },
                     { id: 'profile', label: profileButtonLabel, icon: '', section: 'global', tooltip: profileButtonTooltip, clickHandler: this._onProfileButtonClick.bind(this) }]);


                // Initialize the pageHeaderBar to handle the buttons present on it
                this.pageHeaderBar = DR.Store.App.PageHeaderBar.winControl;
                var button = this.pageHeaderBar.element.querySelector("#upper-cart");
                button.onclick = this._onCartButtonClick.bind(this);

            },

            /**
             * Dispatches an event so the dispatcher can handle it
             */ 
            dispatchEvent: function (event, data) {
                WinJS.Utilities.eventMixin.dispatchEvent(event, data);
            },

            /**
             * Default behaviour when the cart button (on bottomAppBar or pageHeaderBar) is clicked
             */
            _onCartButtonClick: function () {
                var unsnapped = true;
                var oSelf = this;

                // Check to see if the application is in snapped view.
                if (appView.value === appViewState.snapped) {
                    unsnapped = Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
                }

                if (unsnapped) {
                    setTimeout(function () {
                        oSelf.dispatchEvent(oSelf.events.CART_BUTTON_CLICKED);
                    }, 0);
                }
            },

            /**
             * Default behaviour when the home button on the topAppBar is clicked
             */
            _onHomeButtonClick: function () {
                this.dispatchEvent(this.events.HOME_BUTTON_CLICKED);
            },

            _onProfileButtonClick: function (e) {
                this.dispatchEvent(this.events.PROFILE_CLICKED);
            },

            showMessage: function(messageText){
                // Get an anchor for the flyout
                var flyoutAnchor = document.getElementById("flyoutAnchor"); 

                var message = document.getElementById("informationFlyout").winControl;
                document.getElementById("notificationText").textContent = messageText;
                message.sticky = true;

                // Show flyout at anchor
                this.message = message;
                message.show(flyoutAnchor); 

            },

            hideMessage: function(message){
                this.message.hide();
            },

            blockAppBar: function () {
                this.topAppBar.disable();
                this.bottomAppBar.disable();
            },
            
            unBlockAppBar: function () {
                this.topAppBar.enable();
                this.bottomAppBar.enable();
            },
 

            showBlockingMessage: function(Message){
                // Create the message dialog and set its content
                var msg = new Windows.UI.Popups.MessageDialog("New updates have been found for this program. Would you like to install the new updates?", "Updates available");

                var cmd = new Windows.UI.Popups.UICommand("Don't install");
                cmd.visible = false;
                msg.commands.append(cmd);

                msg.showAsync();
                //var flyoutAnchor = document.getElementById("flyoutAnchor"); 

                //var message = document.getElementById("informationFlyout").winControl;
                //WinJS.UI.Animation.showPopup(flyoutAnchor, null);

            },

            /**
             * Animates the cart button on pageHeaderBar to show the current number of items on the cart
             */
            animatePageHeaderCartIcon: function (cartQuantity) {

                var button = this.pageHeaderBar.element.querySelector('#upper-cart');
                // If the cart button on the page header bar is not visible there is no animation
                if (button.currentStyle.display === "none") {
                    return;
                }

                var animationIcon = this.pageHeaderBar.element.querySelector('#addToCartAnimation');
                // Sets the animation
                animationIcon.querySelector('#quantity').textContent = cartQuantity;
                
                var offset = _findTopLeft(button);
                var animation;

                // show the icon
                animationIcon.style.left = offset.left + "px";
                animationIcon.style.top = offset.top + "px";
                animationIcon.style.display = "block";

                // set the animation
                animation = WinJS.UI.Animation.createRepositionAnimation(animationIcon);

                // do the transformations.
                WinJS.Utilities.addClass(animationIcon, "end");
                animationIcon.style.left = (offset.left + 10) + "px";
                animationIcon.style.top = (offset.top + 10) + "px";

                // trigger the animation.
                setTimeout(function () {
                    animation.execute().done(function () {
                        // restore original values
                        animationIcon.style.display = "none";
                        WinJS.Utilities.removeClass(animationIcon, 'end');
                    });
                }, 500);
            }

        });

    /**
     * Finds the top left point of an element
     */
    function _findTopLeft(el) {
        var _x = 0;
        var _y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    
    WinJS.Namespace.define("DR.Store.View", {
        MainApplicationView: Class
    });

})();