/**
 * Category page controller
 */
(function () {
    "use strict";

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            /**
             * Loads the data and passes it to the page on initialization
             */
            initPage: function (page, state) {
                // Event Listening
                page.addEventListener(page.events.ITEM_SELECTED, this._onItemSelected.bind(this), false);
                page.addEventListener(page.events.ADD_PRODUCTS_TO_CART, this._onAddToCartClicked.bind(this), false);

                // Create the subcategory data adapter
                var subcategoryDA = new DR.Store.DataSource.SubCategoriesPaginatedDataAdapter(state.item.id);

                // Create the paginated products data adapter
                var productDA = new DR.Store.DataSource.ProductByCategoryPaginatedDataAdapter(state.item.id);
                var dataAdapters = [];
                dataAdapters.push({ name: "Subcategories", da: subcategoryDA });
                dataAdapters.push({ name: "Products", da: productDA });

                // Creates the multi datasource using both data adapters
                var listDS = new DR.Store.DataSource.MultiplePaginatedDataSource(dataAdapters);

                // Send the datasource to the view
                page.setListDataSource(listDS);

                // Set the category name in the view
                page.setCategoryName(state.item.displayName);
            },

            /**
            * Handler executed when an item in the Categories screen is selected
            */
            _onItemSelected: function (e) {
                var item = e.detail.item;
                console.log("[Category Page:] " + item.data.displayName + " selected");
                var url = (item.itemType == DR.Store.Datasource.ItemType.PRODUCT) ? DR.Store.URL.PRODUCT_PAGE : DR.Store.URL.CATEGORY_PAGE;
                this.goToPage(url, { item: item.data });
            },

            /**
            * Sends the notification for add the products selected for the cart
            */
            _onAddToCartClicked: function (e) {
                // Sets the timeStamp to verify if this controller has called addToCart when _onProductsAdded is called
                this._addToCartTimeStamp = new Date().getTime();
                e.detail.timeStamp = this._addToCartTimeStamp;
                
                this.notify(DR.Store.Notifications.ADD_PRODUCTS_TO_CART, e.detail);
            },

            /**
            * Called when a product has been successfully added to the cart
            */
            _onProductsAdded: function (timeStamp) {
                // Compares the timeStamp of the event to determine if the addToCart event was sent by this controller. If so updates the views
                if (timeStamp && timeStamp === this._addToCartTimeStamp) {
                    this.page.clearSelection();
                    this._addToCartTimeStamp = null;
                }
            }
          
        }
    );

    // PRIVATE METHODS


    // EXPOSING THE CLASS
    WinJS.Namespace.define("DR.Store.Controller", {
        CategoryController: Class
    });

})();