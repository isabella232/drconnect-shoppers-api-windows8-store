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
                

                this.page.blockHomeButton();
                this.notify(DR.Store.Notifications.BLOCK_APP, WinJS.Resources.getString("general.notifications.processingOrder").value);
                //state.id
                this.getOrderInformation(16481399323, 0);


            },

            getOrderInformation: function(orderId, numberOfRetry){
                var self = this;
                var maxTries = 5;
                //var delay = 50000;
                var delay = 0;
                setTimeout(function () {
                    DR.Store.Services.orderService.getOrder(orderId).then(function (order) {
                        self.page.setOrder(order);
                        self.notify(DR.Store.Notifications.UNBLOCK_APP);
                        self.page.unBlockHomeButton();
                    }, function (error) {
                        console.log("ThanksController: Error getting order " + orderId + ", retry in 10 seconds");
                        if (numberOfRetry < maxTries) {
                            self.getOrderInformation(orderId, ++numberOfRetry);
                        } else {
                            self.notify(DR.Store.Notifications.UNBLOCK_APP);
                            self.page.unBlockHomeButton();
                        }
                    })
                }, delay);

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