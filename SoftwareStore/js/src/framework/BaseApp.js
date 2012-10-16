(function () {
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */

    var DEFAULT_LOCALE = "en_us"

    var defaultConfig = {};
    
    function getConfig(config) {
        config = config || {};
        //TODO Change to merge
        return config;
    }

    var Class = DR.Class.extend(
        function (config, namespace, dispatcherClass, serviceManagerClass, i18nNamespace) {
            this.config = getConfig(config);
            this.namespace = namespace;
            this.dispatcher = new dispatcherClass();
            if (serviceManagerClass) {
                this.serviceManager = new serviceManagerClass(this.config.key);
            }
            this.namespace.App = this;
            this.namespace.Services = this.serviceManager;

            // TODO Change to use WinJS i18n
            this.locale = new DR.MVC.LocalizationManager(i18nNamespace, DEFAULT_LOCALE);
        },
        {
            config: {},
            namespace: null,
            dispatcher: null,
            serviceManager: null,
            start: function () {
                console.log("App starting...");
                if (!this.serviceManager) {
                    this.dispatcher.initialize()
                    return WinJS.Promise.as(true);
                } else {
                   return this.serviceManager.initialize().then(
                        function () {
                            this.dispatcher.initialize();
                        }.bind(this),
                        function (error) {
                            //TODO Do somehting
                        }.bind(this));
                }
            },
            getDispatcher: function () {
                return this.dispatcher;
            }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        Application: Class
    });

})();