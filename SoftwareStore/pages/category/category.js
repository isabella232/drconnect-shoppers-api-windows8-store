// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/category/category.html", {
        list: null,
        _productTemplate: null,
        _categoryTemplate: null,

        // EVENTS
        events: {
            ITEM_SELECTED: "itemSelected",
            ADD_PRODUCTS_TO_CART: "addProductsToCart"
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            // Gets the List Control
            this.list = element.querySelector("#list").winControl;
            
            // Defines the selection behaviour
            this.list.addEventListener("selectionchanged", this._itemSelected.bind(this));
            this.list.addEventListener("selectionchanging", _onSelectionChanging.bind(this));
            this.list.oniteminvoked = this._onItemInvoked.bind(this);

            // Sets the items template
            this._productTemplate = element.querySelector(".itemtemplate").winControl;
            this._categoryTemplate = element.querySelector(".categorytemplate").winControl;
            this.list.itemTemplate = categoryItemTemplate.bind(this);
            this.list.groupHeaderTemplate = document.getElementById("groupTemplate");
            this.list.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", maxRows: 8, groupInfo: { enableCellSpanning: true, cellWidth: 70, cellHeight: 70 } });

            // Initialize the Application Bars
            this._initializeAppBars();
           
        },

        /**
         * Sets the name of the category in the view's title
         */
        setCategoryName: function (name) {
            this.element.querySelector(".pagetitle").textContent = name;
        },

        /**
         * Sets the datasource for the list (including subcategories and products)
         */
        setListDataSource: function (productsDataSource) {
            // Set the item datasource
            this.list.itemDataSource = productsDataSource;

            // Set the group datasource (will include subcategories and products)
            this.list.groupDataSource = productsDataSource.getGroupDataSource();

            this._showMessageIfEmpty();
        },

        /**
        * Clears the current selected items from the list
        */
        clearSelection: function () {
            this.list.selection.clear();
        },

        /**
         * Shows a message when there are no items to show
         */
        _showMessageIfEmpty: function () {
            var self = this;
            this.list.itemDataSource.getCount().then(function (count) {
                if (count == 0 && !self.list.itemDataSource.getErrorStatus()) {
                    WinJS.Utilities.removeClass(self.element.querySelector("#emptyMessage"), "hidden");
                }
            });
        },

        _onItemInvoked: function (args) {
            var self = this;
            args.detail.itemPromise.then(function (item) {
                self.dispatchEvent(self.events.ITEM_SELECTED, { item: item});
            });
        },

        /**
         * Initializes the application bars
         */
        _initializeAppBars: function () {
            var self = this;

            // Get the localized labels for the commands
            var addButtonLabel = WinJS.Resources.getString('general.button.addToCart.label').value;
            var addButtonTooltip = WinJS.Resources.getString('general.button.addToCart.tooltip').value;
            var sortButtonLabel = WinJS.Resources.getString('general.button.sort.label').value;
            var sortButtonTooltip = WinJS.Resources.getString('general.button.sort.tooltip').value;
            var homeButtonLabel = WinJS.Resources.getString('general.button.home.label').value;
            var homeButtonTooltip = WinJS.Resources.getString('general.button.home.tooltip').value;

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.addCommands(
                  // TODO: Implement addHandler
                [{ id: 'cmdAdd', label: addButtonLabel, icon: 'add', section: 'selection', tooltip: addButtonTooltip, hidden: true, clickHandler: this._onAddToCart.bind(this) },
                    //TODO: Implement SortHandler
                 { id: 'cmdSort', label: sortButtonLabel, icon: '', section: 'global', tooltip: sortButtonTooltip },
                 { id: 'appBarSeparator', type: 'separator', section: 'global' } ]);

            this.topAppBar = DR.Store.App.AppTopBar.winControl;

        },

        /**
         * Behaviour the an items is selected from the list
         */
        _itemSelected: function (item) {
            var count = this.list.selection.count();
            if (count > 0) {
                this.bottomAppBar.showCommands(["cmdAdd"]);
                this.topAppBar.show();
                this.bottomAppBar.show();
            } else {
                this.topAppBar.hide();
                this.bottomAppBar.hide();
                this.bottomAppBar.hideCommands(["cmdAdd"]);
            }
        },

        /**
        * Default behaviour when add products to cart is called.
        */
        _onAddToCart: function () {
            var self = this;
            var selectedItems = [];
            this.list.selection.getItems().then(function (items) {
                items.forEach(function (item) {
                    selectedItems.push({ product: item.data, qty: 1 });
                });
                if (selectedItems.length > 0) {
                    self.dispatchEvent(self.events.ADD_PRODUCTS_TO_CART, selectedItems);
                }
            });
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            this.list.itemDataSource = null;
            // Set the group datasource (will include subcategories and products)
            this.list.groupDataSource =null;
        }

    });

    /**
     * Function called when the selection on the list is changing
     */
    function _onSelectionChanging(event) {
        // Checks if the item type is a category. In that case blocks the event to avoid the selection of a subcategory
        event.detail.newSelection.getItems().then(function (items) {
            items.forEach(function (e, i) {
                if (e.itemType == "category") {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function categoryItemTemplate(itemPromise) {
        // TODO: Add Handling to the error when the view is disposed, it tries to render the items and fails.
        var oSelf = this;
        return itemPromise.then(function (currentItem) {
            var template;
            switch (currentItem.itemType) {
                case DR.Store.Datasource.ItemType.PRODUCT:
                    template = oSelf._productTemplate;
                    break;
                case DR.Store.Datasource.ItemType.CATEGORY:
                    template = oSelf._categoryTemplate;
                    if (!currentItem.data.thumbnailImage) currentItem.data.thumbnailImage = "images/folder.jpg";
                    break;

                default:
                    template = oSelf._productTemplate;
                    break;
            }

            return template.render(currentItem.data);
        });
    }
})();
