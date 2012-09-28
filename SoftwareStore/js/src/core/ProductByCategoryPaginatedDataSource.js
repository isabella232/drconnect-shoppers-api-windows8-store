(function () {
    "use strict";
    /**
     * Super Class for Controllers
     * most of Controller objects will inherit from this 
     */
    var ProductByCategoryPaginatedDataSource = DR.Store.Core.DataSource.PaginatedDataSource.extend(
        function (categoryId) {
            this._super();
            this._categoryId = categoryId
        },
        {
            /**
            * Retrieves a promise the page specified on parameters
            * return: It should return a json{count: <total number of items>, items: <list of items from page>}
            */
            retrievePage: function (pageNumber, pageSize) {
                return DR.Store.Services.productService.listProductsByCategory(this._categoryId, pageNumber, pageSize).then(function (data) {
                    return {
                        count: data.totalResults,
                        items: data.product
                    }
                });
            },
        }
        );

    WinJS.Namespace.define("DR.Store.Core.DataSource", {
        ProductByCategoryPaginatedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (categoryId) {
            this._baseDataSourceConstructor(new ProductByCategoryPaginatedDataSource(categoryId));
        })
    });

})();