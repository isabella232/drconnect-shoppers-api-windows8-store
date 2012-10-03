/**
 * Category page controller
 */
(function () {
    "use strict";

    // TODO CHANGE to another location!
    var PAGE_SIZE = 5;

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page, state) {
                page.addEventListener(page.events.PRODUCT_SELECTED, this._onProductSelected.bind(this), false);
                page.addEventListener(page.events.SUBCATEGORY_SELECTED, this._onSubcategorySelected.bind(this), false);

                var products = new WinJS.Binding.List();
                var subcategories = new WinJS.Binding.List();
                
                var cp = loadSubCategories(page, state.item.id, subcategories);

                var productDataSource = new DR.Store.DataSource.SubCategoriesPaginatedDataAdapter(state.item.id);
                var productDataSource2 = new DR.Store.DataSource.ProductByCategoryPaginatedDataAdapter(state.item.id);
                var dataSources = [];
                dataSources.push({ name: "SubCategories", da: productDataSource });
                dataSources.push({ name: "Products", da: productDataSource2 });
                var multipleDS = new DR.Store.DataSource.MultiplePaginatedDataSource(dataSources);

                var s = new desertsDataSource(desertTypes);
                page.setProductDataSource(multipleDS, s);

                //var pp = loadProducts(page, state.item.id, products);

                page.setCategoryName(state.item.displayName);

                return [cp];
            },

            _onProductSelected: function (e) {
                var item = e.detail.item;
                console.log("[Category Page] " + item.displayName + " (Product) selected");
                this.goToPage(DR.Store.URL.PRODUCT_PAGE, { item: item });
            },

            _onSubcategorySelected: function (e) {
                var item = e.detail.item;
                console.log("[Category Page] " + item.displayName + " (Category) selected");
                this.goToPage(DR.Store.URL.CATEGORY_PAGE, { item: item });
            }
        }
    );

    // PRIVATE METHODS
    function loadSubCategories(page, parentId, list) {
        return DR.Store.Services.categoryService.getCategoryById(parentId, 1, PAGE_SIZE)
            .then(function (cat) {
                if (cat.categories != null) {
                    /*
                    cat.categories.category.forEach(function (c, i) {
                        list.push(c);
                    });
                    */
                    page.setSubcategories(cat.categories.category);
                } else {
                    // No Subcategories
                    page.setSubcategories([]);
                }
            });
    }

    function loadProducts(page, catId, list) {
        return DR.Store.Services.productService.listProductsByCategory(catId, 1, PAGE_SIZE)
            .then(function (products) {
                if (products != null && products.length != 0) {
                    page.setProducts(products);
                    /* products.forEach(function (p, i) {
                         list.push(p);
                     });
                     */
                } else {
                    // No Products
                    page.setProducts([]);
                }
            });
    }

    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        CategoryController: Class
    });



    var desertTypes = [
       { key: "SubCategories", type: "SubCategories", firstItemIndex: 0 },
       { key: "Products", type: "Products", firstItemIndex: 10 }
    ];




    var desertsDataAdapter = WinJS.Class.define(
            function (groupData) {
                // Constructor
                this._groupData = groupData;
            },

            // Data Adapter interface methods
            // These define the contract between the virtualized datasource and the data adapter.
            // These methods will be called by virtualized datasource to fetch items, count etc.
            {
                // This example only implements the itemsFromIndex, itemsFromKey and count methods

                // Called to get a count of the items, this can be async so return a promise for the count
                getCount: function () {
                    var that = this;
                    return WinJS.Promise.wrap(that._groupData.length);
                },

                // Called by the virtualized datasource to fetch a list of the groups based on group index
                // It will request a specific group and hints for a number of groups either side of it
                // The implementation should return the specific group, and can choose how many either side
                // to also send back. It can be more or less than those requested.
                //
                // Must return back an object containing fields:
                //   items: The array of groups of the form:
                //      [{ key: groupkey1, firstItemIndexHint: 0, data : { field1: value, field2: value, ... }}, { key: groupkey2, firstItemIndexHint: 27, data : {...}}, ...
                //   offset: The offset into the array for the requested group
                //   totalCount: (optional) an update of the count of items
                itemsFromIndex: function (requestIndex, countBefore, countAfter) {
                    var that = this;

                    if (requestIndex >= that._groupData.length) {
                        return Promise.wrapError(new WinJS.ErrorFromName(UI.FetchError.doesNotExist));
                    }

                    var lastFetchIndex = Math.min(requestIndex + countAfter, that._groupData.length - 1);
                    var fetchIndex = Math.max(requestIndex - countBefore, 0);
                    var results = [];

                    // form the array of groups
                    for (var i = fetchIndex; i <= lastFetchIndex; i++) {
                        var group = that._groupData[i];
                        results.push({
                            key: group.key,
                            firstItemIndexHint: group.firstItemIndex,
                            data: group
                        });
                    }
                    return WinJS.Promise.wrap({
                        items: results, // The array of items
                        offset: requestIndex - fetchIndex, // The offset into the array for the requested item
                        totalCount: that._groupData.length // The total count
                    });
                },

                // Called by the virtualized datasource to fetch groups based on the group's key
                // It will request a specific group and hints for a number of groups either side of it
                // The implementation should return the specific group, and can choose how many either side
                // to also send back. It can be more or less than those requested.
                //
                // Must return back an object containing fields:
                //   [{ key: groupkey1, firstItemIndexHint: 0, data : { field1: value, field2: value, ... }}, { key: groupkey2, firstItemIndexHint: 27, data : {...}}, ...
                //   offset: The offset into the array for the requested group
                //   absoluteIndex: the index into the list of groups of the requested group
                //   totalCount: (optional) an update of the count of items
                itemsFromKey: function (requestKey, countBefore, countAfter) {
                    var that = this;
                    var requestIndex = null;

                    // Find the group in the collection
                    for (var i = 0, len = that._groupData.length; i < len; i++) {
                        if (that._groupData[i].key === requestKey) {
                            requestIndex = i;
                            break;
                        }
                    }
                    if (requestIndex === null) {
                        return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                    }

                    var lastFetchIndex = Math.min(requestIndex + countAfter, that._groupData.length - 1);
                    var fetchIndex = Math.max(requestIndex - countBefore, 0);
                    var results = [];

                    //iterate and form the collection of the results
                    for (var j = fetchIndex; j <= lastFetchIndex; j++) {
                        var group = that._groupData[j];
                        results.push({
                            key: group.key, // The key for the group
                            firstItemIndexHint: group.firstItemIndex, // The index into the items for the first item in the group
                            data: group // The data for the specific group
                        });
                    }

                    // Results can be async so the result is supplied as a promise
                    return WinJS.Promise.wrap({
                        items: results, // The array of items
                        offset: requestIndex - fetchIndex, // The offset into the array for the requested item
                        absoluteIndex: requestIndex, // The index into the collection of the item referenced by key
                        totalCount: that._groupData.length // The total length of the collection
                    });
                },

            });

    // Create a DataSource by deriving and wrapping the data adapter with a VirtualizedDataSource
    var desertsDataSource = WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (data) {
        this._baseDataSourceConstructor(new desertsDataAdapter(data));
    });
})();