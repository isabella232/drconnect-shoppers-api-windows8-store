(function () {
    "use strict";

    var Class = DR.Class.extend(
        function (dispatcher) {
            this.dispatcher = dispatcher;

            // Register event handler for Win8 search event
            Windows.ApplicationModel.Search.SearchPane.getForCurrentView().onquerysubmitted = this._onSearch.bind(this);
        },
        {
            dispatcher: null,

            /**
             * Event handler for win8 search
             * Returns true if the query is valid (not empty). False otherwise
             */
            _onSearch: function (e) {
                if (e.queryText && e.queryText != "") {
                    console.log("User searched: " + e.queryText);
                    this.dispatcher.handle(DR.MVC.Notifications.SEARCH_REQUESTED, e.queryText);
                    return true;
                } else {
                    console.log("No search keyword was entered");
                    return false;
                }
            },

            /**
             * Method to invoke search manually
             */
            search: function (args) {
                return this._onSearch(args);
            }

        }
    );

    WinJS.Namespace.define("DR.MVC", {
        SearchManager: Class
    });
})();