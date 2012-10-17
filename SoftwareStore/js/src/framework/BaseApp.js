(function () {
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */

    var defaultConfig = {};
    
    function getConfig(config) {
        config = config || {};
        //TODO Change to merge
        return config;
    }

    var Class = DR.Class.extend(
        function (config, implementation) {
            this.config = getConfig(config);
            this.namespace = implementation.namespace;
            this.dispatcher = new implementation.dispatcherClass();
            
            this.initManagers(implementation.serviceManagerClass);
            
            this.namespace.App = this;
        },
        {
            config: {},
            namespace: null,
            dispatcher: null,
            serviceManager: null,
            searchManager: null,
            sharingManager: null,
            navigationManager: null,

            /**
             * Initializes the app's managers
             */
            initManagers: function(serviceManagerClass) {
                if (serviceManagerClass) {
                    this.serviceManager = new serviceManagerClass(this.config.key);
                    this.namespace.Services = this.serviceManager;
                }
            },

            /**
             * Initializes the dispatcher and the managers that depend on it
             */
            _initDispatcher: function () {
                this.dispatcher.initialize();

                this.searchManager = new DR.MVC.SearchManager(this.dispatcher);
                this.sharingManager = new DR.MVC.Sharing.SharingManager(this, this.dispatcher.sharingMappings);

                this.navigationManager = new DR.MVC.UrlNavigationManager(this.dispatcher.urlMappings, this.config.landingPage, this.searchManager);

                // Restore the nav history from the session if available
                var app = WinJS.Application;
                if (app.sessionState.history) {
                    this.navigationManager.setNavigationHistory(app.sessionState.history);
                }
            },

            startServices: function () {
                console.log("App starting...");
                if (!this.serviceManager) {
                    this._initDispatcher();
                    return WinJS.Promise.as(true);
                } else {
                    return this.serviceManager.initialize().then(
                        function () {
                            this._initDispatcher();
                        }.bind(this),
                        function (error) {
                            //TODO Do somehting
                        }.bind(this));
                }
            },
            getDispatcher: function () {
                return this.dispatcher;
            },
            navigateTo: function (url, data) {
                this.navigationManager.goToPage(url, data);
            },
            getCurrentUrl: function() {
                return this.navigationManager.getCurrentUrl();
            },

            start: function (args) {
                var app = WinJS.Application;
                var activation = Windows.ApplicationModel.Activation;

                if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.running && args.detail.previousExecutionState !== activation.ApplicationExecutionState.suspended) {
                    if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
                        this.reloadContext();
                    } else {
                        this.showSplash(args);
                    }
                    
                    var self = this;
                    return this.startServices().then(function () {
                        if (self.splash) self.splash.remove();

                        self.navigationManager.showInitialPage(args);
                    });
                } else {
                    this.navigationManager.showInitialPage(args);
                    return WinJS.Promise.wrap(true);
                }
            },

            showSplash: function (args) {
                if (this.config.extendedSplashImage) {
                    // Retrieve splash screen object
                    this.splash = new DR.Store.Util.ExtendedSplash(args.detail.splashScreen, this.config.extendedSplashImage);
                    // Create and display the extended splash screen using the splash screen object and the same image specified for the system splash screen.
                    if (!Windows.ApplicationModel.DesignMode) {
                        this.splash.show();
                    }
                }
                
                
            },
            reloadContext: function () {
            }
            
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        Application: Class
    });

})();