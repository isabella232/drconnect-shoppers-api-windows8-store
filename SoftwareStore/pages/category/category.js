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
            CART_BUTTON_CLICKED: "cartButtonClicked",
            HOME_BUTTON_CLICKED: "homeButtonClicked"
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
            this.list.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", groupInfo: { enableCellSpanning: true, cellWidth: 150, cellHeight: 75 } });

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
         * Shows a message when there are no items to show
         */
        _showMessageIfEmpty: function () {
            var self = this;
            this.list.itemDataSource.getCount().then(function (count) {
                if (count == 0) {
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

        _onCartButtonClick: function () {
            this.dispatchEvent(this.events.CART_BUTTON_CLICKED);
        },

        _onHomeButtonClick: function () {
            this.dispatchEvent(this.events.HOME_BUTTON_CLICKED);
        },
        
        _initializeAppBars: function () {
            var self = this;
            // Initialize the Bottom AppBar
            this.bottomAppBar = this.element.querySelector("#bottomAppBar").winControl;
            this.bottomAppBar.addCommands(
                  // TODO: Implement addHandler
                [{ options: { id: 'cmdAdd', label: 'Add', icon: 'add', section: 'selection', tooltip: 'Add item' } },
                    //TODO: Implement SortHandler
                 { options: { id: 'cmdSort', label: 'Sort', icon: '', section: 'global', tooltip: 'Sort' } },
                 { options: { id: 'appBarSeparator', type: 'separator', section: 'global' } },
                 { options: { id: 'gotoCart', label: 'View Cart', icon: '', section: 'global', tooltip: 'Go To Cart' }, clickHandler: this._onCartButtonClick.bind(this) }]);

            this.bottomAppBar.hideCommands(["cmdAdd"]);

            this.topAppBar = this.element.querySelector("#topAppBar").winControl;
            this.topAppBar.addCommands(
                [{ options: { id: 'home', label: 'Home', icon: '', section: 'global', tooltip: 'Home' }, clickHandler: this._onHomeButtonClick.bind(this) },
                 { options: { id: 'profile', label: 'Profile', icon: '', section: 'global', tooltip: 'View Profile' } }]);
        },

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
                    break;

                default:
                    template = oSelf._productTemplate;
                    break;
            }

            return template.render(currentItem.data);
        });
    }
})();
