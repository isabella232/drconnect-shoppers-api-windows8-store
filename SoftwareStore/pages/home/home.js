(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        events: {
            ITEM_SELECTED: "itemSelected"
        },
        itemsList: null,
        _itemTemplate: null,
        _categoryTemplate: null,

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.itemsList = this.element.querySelector(".itemslist").winControl;
            this.itemsList.oniteminvoked = this._onItemInvoked.bind(this);

            // Set the template variables
            this._itemTemplate = element.querySelector(".itemtemplate").winControl;
            this._categoryTemplate = element.querySelector(".categorytemplate").winControl;
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
        }
    });

    function renderHeader(itemPromise) {
        var self = this;
        return itemPromise.then(function (currentItem) {
            var Template = document.body.querySelector(".headertemplate").winControl;
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
