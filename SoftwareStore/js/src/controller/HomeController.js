/**
 * Super Class for Controllers
 * most of Controller objects will inherit from this 
 */
(function () {
    "use strict";
    // TODO: MUST BE PART OF THE CONFIG
    var PAGE_SIZE = 5;

    var Class = DR.MVC.SinglePageController.extend(
        function () {
            this._super();
        },
        {
            initPage: function (page) {
                var list = new WinJS.Binding.List();
                page.addEventListener(page.events.ITEM_SELECTED, this._onItemSelected.bind(this), false);
                page.addEventListener(page.events.ADD_PRODUCTS_TO_CART, this._onAddToCartClicked.bind(this), false);
                page.setHomeItems(getGroupedList(list));
                var p = this._loadItems(list);
                return [p];
            },


            /**
             * Load the items in the list
             */
            _loadItems: function (list) {
                //DR.Store.Services.offerService.getOffersByPop("SiteMerchandising_HomePageStoreSpecials").then(function (offers) {
                //    var a = offers;
                //});

                var spotPromises = [];
                spotPromises.push(DR.Store.Services.offerService.getOffersByPop("AppMP-230wX470h"));
                spotPromises.push(DR.Store.Services.offerService.getOffersByPop("AppMP-230wX230"));
                var promises = [];

                promises.push(WinJS.Promise.join(spotPromises).then(processSpotLight, processSpotLightError));


                return DR.Store.Services.categoryService.getRootCategories()
               .then(function (categories) {
                   //var promises = categories.map(function (category, index) {
                   //    return DR.Store.Services.categoryService.getCategoryById(category.id).then(loadCategoryData);
                   //});
                   categories.forEach(function (category, index) {
                        promises.push(DR.Store.Services.categoryService.getCategoryById(category.id).then(loadCategoryData));
                   });

                   return fillItemsList(promises, list);
               }, function (error) {
                   console.log("HomeController: Error Retrieving Root Categories: " + error.details.error.code + " - " + error.details.error.description);
               });
            },

            /**
             * Handler executed when an item in the Home screen is selected
             */
            _onItemSelected: function (e) {
                var item = e.detail.item;
                console.log("[Home] " + item.displayName + " (" + item.type + ") selected");
                var url;
                switch (item.type) {
                    case DR.Store.Datasource.ItemType.PRODUCT:
                        url = DR.Store.URL.PRODUCT_PAGE;
                        break;
                    case DR.Store.Datasource.ItemType.CATEGORY:
                        url = DR.Store.URL.CATEGORY_PAGE;
                        break;
                    case DR.Store.Datasource.ItemType.SPOTLIGHT:
                        url = DR.Store.URL.OFFER_PAGE;
                        break;
                    default:
                        url = DR.Store.URL.PRODUCT_PAGE;
                        break;
                }
                this.goToPage(url, { item: item });
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
            _onCartChanged: function (timeStamp) {
                // Compares the timeStamp of the event to determine if the addToCart event was sent by this controller. If so updates the views
                if (timeStamp && timeStamp === this._addToCartTimeStamp) {
                    this.page.clearSelection();
                    this._addToCartTimeStamp = null;
                }
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
                childType: DR.Store.Datasource.ItemType.CATEGORY
            }
        } else {
            return DR.Store.Services.productService.listSampleProductsForCategory(cat.id, PAGE_SIZE)
                .then(function (data) {
                    var product;
                    if (data.product) {
                        product = data.product;
                    } else {
                        product = [];
                    }
                    return {
                        id: cat.id,
                        displayName: cat.displayName,
                        children: product,
                        childType: DR.Store.Datasource.ItemType.PRODUCT
                    }
                }, function (error) {
                    console.log("HomeController: Error Retrieving Child Products: " + error.details.error.code + " - " + error.details.error.description);
                });
        }
    }

    function processSpotLight(offers) {
        var children = [];
        var childType = DR.Store.Datasource.ItemType.MAIN_SPOTLIGHT;
        offers.forEach(function (offer) {
            offer.offer.forEach(function (spotLight) {
                spotLight.childType = childType;
                children.push(spotLight);
            });

            childType = DR.Store.Datasource.ItemType.SECOND_SPOTLIGHT
        });

        return {
            id: -1,
            displayName: "SpotLight",
            children: children,
            childType: DR.Store.Datasource.ItemType.SPOTLIGHT
        }

    }

    function processSpotLightError(errors) {
        errors.forEach(function (error) {
            if (error.details) {
                console.log("HomeController: Error Retrieving Spotlight offers: " + error.details.error.code + " - " + error.details.error.description);
            }
        });
        
    }

    function fillItemsList(promises, list) {
        return WinJS.Promise.join(promises).then(function (categories) {
            categories.forEach(function (category, index) {
                if (category) {
                    category.children.forEach(function (item, index) {
                        item.category = { id: category.id, displayName: category.displayName };
                        item.type = category.childType;
                        list.push(item);
                    });
                }
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