(function () {
    "use strict";
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */
    var Class = DR.MVC.Application.extend(
        function (config) {
            this._super(config, DR.Store, DR.Store.Core.StoreDispatcher, DR.Store.Service.ServiceManager);
        },
        {
            /**
             * Overrides start function to hide splash screen when ready
             */
            start: function () {
                return this._super().then(function () {
                    this.splash.remove();
                    //ExtendedSplash.remove();
                }.bind(this));
            }
            
        });

    WinJS.Namespace.define("DR.Store.Core", {
        Application: Class
    });

})();