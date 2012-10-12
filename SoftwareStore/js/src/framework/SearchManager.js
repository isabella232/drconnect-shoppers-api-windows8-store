(function () {
    "use strict";

    var Class = DR.Class.extend(
        function (dispatcher) {
            this.dispatcher = dispatcher;
            Windows.ApplicationModel.Search.SearchPane.getForCurrentView().onquerysubmitted = this._onSearch.bind(this);
        },
        {
            dispatcher: null,

            _onSearch: function (e) {
                console.log("User searched: " + e.queryText);
                this.dispatcher.handle(DR.MVC.Notifications.SEARCH_REQUESTED, e.queryText);
            }

        }
    );

    WinJS.Namespace.define("DR.MVC", {
        SearchManager: Class
    });
})();