(function () {
    "use strict";

    /**
     * Inherits PaginatedDataAdapter to overriding the retrievePage in order to call the corresponding service
     * 
     */
    var SubCategoriesPaginatedDataAdapter = DR.Store.DataSource.PaginatedDataAdapter.extend(
        function (categoryId) {
            this._super();
            this._categoryId = categoryId;
            this._itemType = DR.Store.Datasource.ItemType.CATEGORY;
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
                }, function (error) {
                    console.log("SubCategoriesPaginatedDataAdapter: Error retrieving subcategories: " + error[0].details.error.code + " - " + error[0].details.error.description);
                    return {
                        count: 0,
                        items: []
                    }
                });
            }
        }
        );

    WinJS.Namespace.define("DR.Store.DataSource", {
        SubCategoriesPaginatedDataAdapter: SubCategoriesPaginatedDataAdapter,
        SubCategoriesPaginatedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (categoryId) {
            this._baseDataSourceConstructor(new SubCategoriesPaginatedDataAdapter(categoryId));
        })
    });



})();