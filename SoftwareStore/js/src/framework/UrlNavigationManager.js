/**
 * Url Navigation Manager
 * Handles navigation logic (URL changes, initial page to show, nav history restore).
 * 
 */
(function () {
    "use strict";

    var nav = WinJS.Navigation;

    //TODO Handle security
    var Class = DR.MVC.UrlMapper.extend(
        /**
         * Constructor. Receives the url mappings, the configured landing page and the search manager (when the app is loaded in search mode)
         */
        function (mappings, landingPage, searchManager) {
            this._super(mappings);
            nav.onnavigated = this.onNavigated.bind(this);
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
                console.log("Navigating to " + uri);
                this._super(uri, params);
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
            goToPage: function (url, data) {
                nav.navigate(url, data);
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