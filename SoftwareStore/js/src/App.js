(function () {
    "use strict";
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */
    var Class = DR.MVC.Application.extend(
        function (config) {
            this._super(config, this.getImplementation());
        },
        {
            getImplementation: function () {
                return { 
                    namespace: DR.Store, 
                    dispatcherClass: DR.Store.Core.StoreDispatcher, 
                    serviceManagerClass: DR.Store.Service.ServiceManager, 
                    i18nNamespace: DR.Store.i18n
                };
            }
        });

    WinJS.Namespace.define("DR.Store.Core", {
        Application: Class
    });

})();