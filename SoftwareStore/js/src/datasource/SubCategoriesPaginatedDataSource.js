(function () {
    "use strict";
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */
    var SubCategoriesPaginatedDataAdapter = DR.Store.Core.DataSource.PaginatedDataAdapter.extend(
        function (categoryId) {
            this._super();
            this._categoryId = categoryId;
        },
        {
            /**
            * Retrieves a promise the page specified on parameters
            * return: It should return a json{count: <total number of items>, items: <list of items from page>}
            */
            retrievePage: function (pageNumber, pageSize) {
                return DR.Store.Services.categoryService.getCategoryById(this._categoryId)
                .then(function (cat) {
                    if (cat.categories != null) {
                        return {
                            count: cat.categories.category.length,
                            items: cat.categories.category
                        }
                    } else {
                        return {
                            count: 0,
                            items: []
                        }
                    }
                });
            }
        }
        );

    WinJS.Namespace.define("DR.Store.Core.DataSource", {
        SubCategoriesPaginatedDataAdapter: SubCategoriesPaginatedDataAdapter,
        SubCategoriesPaginatedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (categoryId) {
            this._baseDataSourceConstructor(new SubCategoriesPaginatedDataAdapter(categoryId));
        })
    });



})();