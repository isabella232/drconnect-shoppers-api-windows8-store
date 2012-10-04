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
            /**
             * Loads the data and passes it to the page on initialization
             */
            initPage: function (page, state) {
                page.addEventListener(page.events.PRODUCT_SELECTED, this._onProductSelected.bind(this), false);
                page.addEventListener(page.events.SUBCATEGORY_SELECTED, this._onSubcategorySelected.bind(this), false);

                // Create the subcategory data adapter
                var subcategoryDA = new DR.Store.DataSource.SubCategoriesPaginatedDataAdapter(state.item.id);

                // Create the paginated products data adapter
                var productDA = new DR.Store.DataSource.ProductByCategoryPaginatedDataAdapter(state.item.id);
                var dataAdapters = [];
                dataAdapters.push({ name: "SubCategories", da: subcategoryDA });
                dataAdapters.push({ name: "Products", da: productDA });

                // Creates the multi datasource using both data adapters
                var listDS = new DR.Store.DataSource.MultiplePaginatedDataSource(dataAdapters);

                // Send the datasource to the view
                page.setListDataSource(listDS);

                // Set the category name in the view
                page.setCategoryName(state.item.displayName);
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


    // EXPOSING THE CLASS
    WinJS.Namespace.define("DR.Store.Controller", {
        CategoryController: Class
    });

})();