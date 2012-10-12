(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        events: {
            ITEM_SELECTED: "itemSelected",
            CART_BUTTON_CLICKED: "cartButtonClicked"
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

        _onCartButtonClick: function () {
            this.dispatchEvent(this.events.CART_BUTTON_CLICKED);
        },
        
        _initializeAppBars: function () {
            var self = this;
            // Initialize the Bottom AppBar
            this.bottomAppBar = this.element.querySelector("#bottomAppBar").winControl;
            this.bottomAppBar.addCommands(
                [{ options: { id: 'cmdAdd', label: 'Add', icon: 'add', section: 'selection', tooltip: 'Add item' }},
                 { options: { id: 'gotoCart', label: 'View Cart', icon: '', section: 'global', tooltip: 'Go To Cart' }, clickHandler: this._onCartButtonClick.bind(this) }]);

            this.bottomAppBar.hideCommands(["cmdAdd"]);

            this.topAppBar = this.element.querySelector("#topAppBar").winControl;
            this.topAppBar.addCommand({ id: 'profile', label: 'Profile', icon: '', section: 'global', tooltip: 'View Profile' });
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
                case 'product':
                    template = oSelf._itemTemplate;
                    break;
                case 'category':
                    template = oSelf._categoryTemplate;
                    break;

                default:
                    template = oSelf._itemTemplate;
                    break;
            }

            return template.render(currentItem.data);
        });
    }
})();
