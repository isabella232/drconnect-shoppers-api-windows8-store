/**
 * Inherits PaginatedDataAdapter to overriding the retrievePage in order to call the corresponding service
 * Looks for products by keyword
 */
(function () {
    "use strict";

    var Class = DR.Store.DataSource.PaginatedDataAdapter.extend(
        function (keyword) {
            this._super();
            this._keyword = keyword;
            this._itemType = DR.Store.Datasource.ItemType.PRODUCT;
        },
        {
            /**
            * Retrieves a promise the page specified on parameters
            * return: It should return a json{count: <total number of items>, items: <list of items from page>}
            * @Override
            */
            retrievePage: function (pageNumber, pageSize) {
                return DR.Store.Services.productService.searchProduct(this._keyword, pageNumber, pageSize)
                    .then(function (data) {
                        return {
                            count: data.totalResults,
                            items: data.product
                        }
                    });
            }
        }
        );

    WinJS.Namespace.define("DR.Store.DataSource", {
        SearchProductPaginatedDataAdapter: Class,
        SearchProductPaginatedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (keyword) {
            this._baseDataSourceConstructor(new Class(keyword));
        })
    });



})();