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

                var productDataSource = new DR.Store.Core.DataSource.ProductByCategoryPaginatedDataSource(state.item.id);
                page.setProductDataSource(productDataSource);

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

})();