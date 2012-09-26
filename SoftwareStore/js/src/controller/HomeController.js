/**
 * Super Class for Controllers
 * most of Controller objects will inherit from this 
 */
(function () {
    "use strict";
    
    // TODO MUST BE PART OF THE CONFIG!
    var PAGE_SIZE = 5;

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page) {
                var list = new WinJS.Binding.List();
                page.addEventListener(page.events.ITEM_SELECTED, this._onItemSelected.bind(this), false);
                page.setHomeItems(getGroupedList(list));
                this._loadItems(list);
            },

            /**
             * Load the items in the list
             */
            _loadItems: function (list) {
                DR.Store.Services.categoryService.getRootCategories()
               .then(function (categories) {
                   var promises = categories.map(function (category, index) {
                       return DR.Store.Services.categoryService.getCategoryById(category.id).then(loadCategoryData);
                   });

                   fillItemsList(promises, list);
               });
            },

            /**
             * Handler executed when an item in the Home screen is selected
             */
            _onItemSelected: function (e) {
                var item = e.detail.item;
                console.log("[Home] " + item.displayName + " (" + item.type + ") selected");
                var url = (item.type == "product")?DR.Store.URL.PRODUCT_PAGE:DR.Store.URL.CATEGORY_PAGE;
                this.goToPage(url, { item: item });
            }
        }
    );

    // PRIVATE METHODS

    function loadCategoryData(cat) {
        if (cat.categories != null) {
            return {
                id: cat.id,
                displayName: cat.displayName,
                children: cat.categories.category,
                childType: "category"
            }
        } else {
            return DR.Store.Services.productService.listSampleProductsForCategory(cat.id, PAGE_SIZE)
                .then(function (products) {
                    return {
                        id: cat.id,
                        displayName: cat.displayName,
                        children: products,
                        childType: "product"
                    }
                });
        }
    }

    function fillItemsList(promises, list) {
        WinJS.Promise.join(promises).then(function (categories) {
            categories.forEach(function (category, index) {
                category.children.forEach(function (item, index) {
                    item.category = { id: category.id, displayName: category.displayName };
                    item.type = category.childType;
                    list.push(item);
                });
            });
        });
    }

    function getGroupedList(list) {
        return list.createGrouped(
            function groupKeySelector(item) { return item.category.id || item.id; },
            function groupDataSelector(item) { return item.category; }
        );
    }

    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Controller", {
        HomeController: Class
    });

})();