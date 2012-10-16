/**
 * Product search page controller
 */
(function () {
    "use strict";

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            /**
             * Called when the page is shown
             */
            initPage: function (page, keyword) {
                var self = this;

                // Create the paginated product search data adapter using the keyword
                var searchDS = new DR.Store.DataSource.SearchProductPaginatedDataSource(keyword);

                // Send the datasource to the view
                page.setListDataSource(searchDS);

                // Set the keyword to use it in the header
                page.setKeyword(keyword);
            },

            /**
             * Method called when the user uses the Windows 8 native search
             */
            searchRequested: function (queryText) {
                // Navigate to the search page, the rest is done there
                this.goToPage(DR.Store.URL.SEARCH_PAGE, queryText);
            }
        }
    );

    // PRIVATE METHODS

    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        SearchController: Class
    });

})();