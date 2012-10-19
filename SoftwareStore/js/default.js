// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var storeApp = new DR.Store.Core.Application({ key: "604df5ac990fbc67dab8fc098af271e6", extendedSplashImage: "/images/SoftwareStoreSplashScreen.png", landingPage: DR.Store.URL.HOME_PAGE });

    if (!console.debug) {
        console.debug = console.log;
    }

    app.addEventListener("activated", function (args) {
        args.setPromise(WinJS.UI.processAll().then(function () {
            return storeApp.start(args);
        }));
        return;

        if (args.detail.kind === activation.ActivationKind.launch || args.detail.kind === activation.ActivationKind.search) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.running) {
                if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                    // TODO: This application has been newly launched. Initialize
                    // your application here.

                    // Retrieve splash screen object
                    //storeApp.splash = new DR.Store.Util.ExtendedSplash(args.detail.splashScreen, "/images/SoftwareStoreSplashScreen.png");
                    // Create and display the extended splash screen using the splash screen object and the same image specified for the system splash screen.
                    //if (!Windows.ApplicationModel.DesignMode) {
                    //    storeApp.splash.show();
                    //}

                } else {
                    // TODO: This application has been reactivated from suspension.
                    // Restore application state here.
                }
                
                if (app.sessionState.history) {
                    nav.history = app.sessionState.history;
                }
                
                
                args.setPromise(WinJS.UI.processAll().then(function () {
                    
                    return storeApp.start().then(function () {
                        if (nav.location) {
                            nav.history.current.initialPlaceholder = true;
                            return storeApp.navigateTo(nav.location, nav.state);
                        } else {
                            return storeApp.navigateTo(storeApp.pageNavigator.home);
                        }
                    });
                    

                }));
            }
        }
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    app.start();
})();
