(function () {
    "use strict";

    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
    var nav = WinJS.Navigation;
    var URL_CHANGE_NOTIFICATION = "urlChanged";
    var SHARE_NOTIFICATION = "elementShared";
    var SEARCH_NOTIFICATION = "userSearched";

    /**
     * Default methods to be called in the controllers if no methods are specified in the mappings
     */
    var DEFAULT_CONTROLLER_METHOD = "handle";
    var DEFAULT_CONTROLLER_URL_METHOD = "handle";
    var DEFAULT_CONTROLLER_SHARE_METHOD = "share";

    
    /**
     * Base Class for dispatcher
     * Provides generic dispatcher funcionality (handling and dispatching notifications and listening to URL changes)
     * Each application must extend it and declare their own mappings
     */
    var BaseDispatcher = DR.Class.extend(
        function () {
        },
        {

            /**
             * Properties
             */
            mappings: {},
            urlMappings: {},
            sharingMappings: {},
            pageNavigator: null,
            controllers: null,
            navigationManager: null,
            sharingManager: null,
            searchManager: null,

            navigated: function (e) {
                this.handle(URL_CHANGE_NOTIFICATION, e.detail);
            },

            onShareRequest: function(e) {
                this.handle(SHARE_NOTIFICATION, { location: this.getCurrentUrl(), sharingEvent: e });
            },

            initialize: function () {
                console.log("Initializing dispatcher");
                this.controllers = this.initControllers();

                nav.onnavigated = this.navigated.bind(this);
                
                dataTransferManager.ondatarequested = this.onShareRequest.bind(this);

                this.declareUrlMappings(DR.Store.URL, this.controllers);
                this.navigationManager = new DR.MVC.UrlNavigationManager(this);

                this.declareSharingMappings(DR.Store.URL, this.controllers);
                this.sharingManager = new DR.MVC.Sharing.SharingManager(this);

                this.declareMappings(DR.Store.Notifications, this.controllers);

                this.addMapping(SHARE_NOTIFICATION, this.sharingManager);
                this.addMapping(URL_CHANGE_NOTIFICATION, this.navigationManager);

                this.searchManager = new DR.MVC.SearchManager(this);
            },

            getCurrentUrl: function() {
                return this.navigationManager.getCurrentUrl();
            },

            navigateTo: function (url, data) {
                return this.navigationManager.goToPage(url, data);
            },

            /**
             * Must create all the controllers and return them in 1 object
             * By default, no controllers are created
             */
            initControllers: function () {
                return {};
            },

            /**
             * Method that should be overriden to declare all the notification mappings using addMapping().
             * By default no mapping is created
             */
            declareMappings: function () { },

            /**
             * Method that should be overriden to declare all the URL mappings using addUrlMapping().
             * By default no mapping is created
             */
            declareUrlMappings: function () { },

            /**
             * Method that should be overriden to declare all the sharing mappings (URL to controller) using addSharingMapping().
             * By default no mapping is created
             */
            declareSharingMappings: function () { },

            /**
             * Creates a new mapping (notification -> controller.method)
             * If no method is defined, DEFAULT_CONTROLLER_METHOD is used
             * If params are defined, they override the parameters passed when the notification is triggered  
             */
            addMapping: function (notificationName, controller, method, params) {
                if (!method) method = DEFAULT_CONTROLLER_METHOD;
                if (!controller) throw Error("The controller to be mapped to " + notificationName + " is undefined");
                if (typeof controller[method] !== 'function') throw Error("The method does not exist on the controller");

                console.log("Adding mapping for '" + notificationName + "'")
                if (!this.mappings[notificationName]) {
                    this.mappings[notificationName] = [];
                }
                this.mappings[notificationName].push({ "controller": controller, "method": method, "params": params });
            },

            /**
             * Creates a new URL mapping (URL -> controller.method)
             * If the 'method' parameter is not set, DEFAULT_CONTROLLER_URL_METHOD is used
             * If the 'secured' parameter is set, the URL will be accessible only to authenticated users (default: false)
             */
            addUrlMapping: function (url, controller, secured, method) {
                if (!method) method = DEFAULT_CONTROLLER_URL_METHOD;
                if (!controller) throw Error("The controller to be mapped to URI " + url + " is undefined");
                if (typeof controller[method] !== 'function') throw Error("The method does not exist on the controller");

                console.log("Adding " + ((secured) ? "(Secured) " : "") + "URL mapping for '" + url + "'")

                this.urlMappings[url] = { "controller": controller, "method": method, "secured": secured };
            },

            /**
             * Creates a new Sharing mapping (URL -> controller.method)
             * If the 'method' parameter is not set, DEFAULT_CONTROLLER_SHARE_METHOD is used
             */
            addSharingMapping: function (url, controller, async, method) {
                if (!method) method = DEFAULT_CONTROLLER_SHARE_METHOD;
                if (!async) async = false;
                if (!controller) throw Error("The controller to be mapped to URI " + url + " is undefined");
                if (typeof controller[method] !== 'function') throw Error("The method does not exist on the controller");

                console.log("Adding Sharing mapping for '" + url + "'")

                this.sharingMappings[url] = { "controller": controller, "method": method, "async": async };
            },

            /**
             * Adds a mapping to the search notification (which is handled by the framework)
             */
            addSearchMapping: function(controller, method, params) {
                this.addMapping(SEARCH_NOTIFICATION, controller, method, params);
            },

            /**
             * Handler for all the notifications
             */
            handle: function (notificationName, data) {
                console.log("[Dispatcher] Notification received: " + notificationName + ". Data: " + JSON.stringify(data));

                var handlers = this.mappings[notificationName];

                if (!handlers || handlers.length == 0) {
                    throw new Error("Mapping not found for notification " + notificationName);
                }

                console.log("[Dispatcher] Found " + handlers.length + " mappings");

                for (var i = 0; i < handlers.length; i++) {
                    if (handlers[i].params) {
                        data = handlers[i].params;
                    }
                    handlers[i].controller[handlers[i].method](data);
                }
            }

        });

    WinJS.Namespace.define("DR.MVC", {
        BaseDispatcher: BaseDispatcher,

        Notifications: {
            SEARCH_REQUESTED: SEARCH_NOTIFICATION
        }
    });

})();