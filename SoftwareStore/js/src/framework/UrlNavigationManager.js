/**
 * Url Navigation Manager
 * Handles navigation logic (URL changes, initial page to show, nav history restore).
 * 
 */
(function () {
    "use strict";

    var SECURITY_EXCEPTION = "securityException";

    var nav = WinJS.Navigation;

    var Class = DR.MVC.UrlMapper.extend(
        /**
         * Constructor. Receives the url mappings, the configured landing page and the search manager (when the app is loaded in search mode)
         */
        function (dispatcher, mappings, landingPage, searchManager) {
            this._super(mappings);
            nav.onnavigated = this.onNavigated.bind(this);
            this.dispatcher = dispatcher;
            this.searchManager = searchManager;
            this.landingPage = landingPage;
        },
        {
            onNavigated: function (e) {
                this.handle(e.detail);
            },

            /**
             * Handle URI change notifications
             */
            doHandle: function (uri, params) {
                this._super(uri, params);
            },

            /**
             * Security filter. If user is not authenticated, it throws an exception
             */
            applySecurity: function() {
                var shopperSrv = DR.Store.Services.userService;
    
                if(!shopperSrv.isAuthenticated()) {
                    throw SECURITY_EXCEPTION;
                }
            },

            /**
             * Handles security exceptions by redirecting to the landing page
             * Any other exception is re-thrown
             */
            handleSecurityException: function (err, uri) {
                if (err == SECURITY_EXCEPTION) {
                    console.log("Unauthorize access to " + uri + ", redirecting to the login page");
                    this.dispatcher.handle(DR.Store.Notifications.LOGIN, uri);
                } else {
                    throw err;
                }
            },

            /** 
             * Gets the current URL
             */
            getCurrentUrl: function () {
                return this.getLastMappedUrl();
            },

            /**
             * Navigates to the specified URL using the arguments
             */
            goToPage: function (uri, data) {
                try {
                    console.log("Navigating to " + uri);
                    var mapping = this.getMapping(uri);
                    if (mapping && mapping.secured) this.applySecurity();

                    nav.navigate(uri, data);
                } catch (err) {
                    this.handleSecurityException(err, uri);
                }
                
            },

            /**
             * Overrides the nav history with the one passed by param
             * Usually used to restore the session's history
             */
            setNavigationHistory: function (history) {
                nav.history = history;
            },

            /**
             * Navigates to the first page, depending on the activation mode and the nav history
             */
            showInitialPage: function (args) {
                var activation = Windows.ApplicationModel.Activation;

                if (args.detail.kind === activation.ActivationKind.launch) {
                    this._showInitialPageLaunchMode();
                } else if (args.detail.kind === activation.ActivationKind.search) {
                    this._showInitialPageSearchMode(args);
                }
            },

            /**
             * Navigates to the initial page when in Launch mode
             */
            _showInitialPageLaunchMode: function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    this.goToPage(nav.location, nav.state);
                } else {
                    this.goToPage(this.landingPage);
                }
            },

            /**
             * Navigates to the initial page when in Search mode
             * If no keyword is specified, the initial page for Launch mode is used.
             */
            _showInitialPageSearchMode: function (args) {
                if (!this.searchManager.search(args.detail)) {
                    this._showInitialPageLaunchMode();
                }
            }
        }
        );

    WinJS.Namespace.define("DR.MVC", {
        UrlNavigationManager: Class
    });

})();