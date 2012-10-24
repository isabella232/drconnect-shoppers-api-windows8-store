(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        events: {
            ITEM_SELECTED: "itemSelected",
            ADD_PRODUCTS_TO_CART: "addProductsToCart"
        },
        itemsList: null,
        bottomAppBar: null,
        topAppBar: null,
        _itemTemplate: null,
        _categoryTemplate: null,

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            
            // Gets the List Control
            this.itemsList = this.element.querySelector(".itemslist").winControl;

            // Defines the selection behaviour
            this.itemsList.addEventListener("selectionchanged", this._itemSelected.bind(this));
            this.itemsList.addEventListener("selectionchanging", _onSelectionChanging.bind(this));
            this.itemsList.oniteminvoked = this._onItemInvoked.bind(this);

            // Set the template variables
            this._itemTemplate = element.querySelector(".itemtemplate").winControl;
            this._categoryTemplate = element.querySelector(".categorytemplate").winControl;

            // Initialize the Application Bars
            this._initializeAppBars();


        },

        dataLoaded: function () {
            WinJS.Utilities.removeClass(document.querySelector('body'), "loading");
        },

        setHomeItems: function (groupedItems) {
            this.itemsList.groupHeaderTemplate = this.element.querySelector(".headertemplate");

            this.itemsList.itemTemplate = homeItemTemplate.bind(this);

            this.itemsList.itemDataSource = groupedItems.dataSource;
            this.itemsList.groupDataSource = groupedItems.groups.dataSource;
            this.itemsList.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", groupInfo: { enableCellSpanning: true, cellWidth: 150, cellHeight: 75 } });
        },

        _onHeaderClicked: function (args) {
            var id = args.srcElement.groupKey;
            var name = args.srcElement.groupName;
        },
        _onItemInvoked: function (args) {
            var self = this;
            args.detail.itemPromise.then(function (item) {
                self.dispatchEvent(self.events.ITEM_SELECTED, { item: item.data });
            });
        },

        _initializeAppBars: function () {
            var self = this;

            // Get the localized labels for the commands
            var addButtonLabel = WinJS.Resources.getString('general.button.addToCart.label').value;
            var addButtonTooltip = WinJS.Resources.getString('general.button.addToCart.tooltip').value;

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.addCommand({ id: 'cmdAdd', label: addButtonLabel, icon: 'add', section: 'selection', tooltip: addButtonTooltip, clickHandler: this._onAddToCart.bind(this)});
            this.bottomAppBar.hideCommands(["cmdAdd"]);

            this.topAppBar = DR.Store.App.AppTopBar.winControl;
            this.topAppBar.hideCommands(["home"]);
            
        },

        _itemSelected: function (item) {
            var count = this.itemsList.selection.count();
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
        _onAddToCart: function () {
            var self = this;
            var selectedItems = [];
            this.itemsList.selection.getItems().then(function (items) {
                items.forEach(function (item) {
                    selectedItems.push({ product: item.data, qty: 1 });
                });
                if (selectedItems.length > 0) {
                    self.dispatchEvent(self.events.ADD_PRODUCTS_TO_CART, selectedItems);
                }
            });
        }
    });

    /**
     * Function called when the selection on the list is changing
     */ 
    function _onSelectionChanging(event) {
        // Checks if the item type is a category. In that case blocks the event to avoid the selection of a subcategory
        event.detail.newSelection.getItems().then(function (items) {
            items.forEach(function (e, i) {
                if (e.data.type == "category") {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function renderHeader(itemPromise) {
        var self = this;
        return itemPromise.then(function (currentItem) {
            var Template = self.element.querySelector(".headertemplate").winControl;
            return Template.render(currentItem.data).then(function (element) {
                var a = element.querySelector(".root-category");
                    a.onclick = self._onHeaderClicked.bind(this);
            });
        });
    }

    function homeItemTemplate(itemPromise) {
        var oSelf = this;
        return itemPromise.then(function (currentItem) {
            var template;
            switch (currentItem.data.type) {
                case DR.Store.Datasource.ItemType.PRODUCT:
                    template = oSelf._itemTemplate;
                    break;
                case DR.Store.Datasource.ItemType.CATEGORY:
                    template = oSelf._categoryTemplate;
                    if (!currentItem.data.thumbnailImage) currentItem.data.thumbnailImage = "images/folder.jpg";
                    break;

                default:
                    template = oSelf._itemTemplate;
                    break;
            }

            return template.render(currentItem.data);
        });
    }
})();
