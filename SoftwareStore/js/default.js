// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    //604df5ac990fbc67dab8fc098af271e6 : aqued
    //dbefd4f1739dded86c0a4967442935b3 : swstore
    //e799b336f0d87f01bc28646a44749535 : lenovods

    var storeApp = new DR.Store.Core.Application({ key: "e799b336f0d87f01bc28646a44749535", extendedSplashImage: "/images/SoftwareStoreSplashScreen.png", landingPage: DR.Store.URL.HOME_PAGE });

    if (!console.debug) {
        console.debug = console.log;
    }

    app.addEventListener("activated", function (args) {
        args.setPromise(WinJS.UI.processAll().then(function () {
            return storeApp.start(args).then(function(){
                storeApp.getDispatcher().handle(DR.Store.Notifications.APPLICATION_STARTED);
            });
        }));
        return;
    });

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        var sessionInfo = DR.Store.Services.securityService.getSessionInfo();
        var serviceManager = DR.Store.App.serviceManager;
        app.sessionState.history = nav.history;
        app.sessionState.sessionInfo = sessionInfo;
        //app.sessionState.serviceManager = serviceManager;
        
    };

    app.start();
})();
