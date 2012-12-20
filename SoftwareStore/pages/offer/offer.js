// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/offer/offer.html", {
        events: {
            ITEM_SELECTED: "itemSelected",
            ADD_PRODUCTS_TO_CART: "addProductsToCart"
        },
        itemsList: null,
        _listItems: null,
        _itemTemplate: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // Gets the List Control
            this.itemsList = this.element.querySelector("#offersList").winControl;
            this.itemsList.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: "top", maxRows: 6, groupInfo: { enableCellSpanning: true, cellWidth: 70, cellHeight: 70 } });
            this.itemsList.itemTemplate = renderItems.bind(this);
            this._listItems = new WinJS.Binding.List();
            this.itemsList.itemDataSource = this._listItems.dataSource;

            // Defines the selection behaviour
            this.itemsList.addEventListener("selectionchanged", this._itemSelected.bind(this));
            this.itemsList.oniteminvoked = this._onItemClicked.bind(this);

            // Set the template variables
            this._itemTemplate = element.querySelector('.candyRackItemtemplate').winControl;

            this._initializeAppBars();
        },



        /**
         * Sets the offer on the page
         */
        setOffer: function (offer) {

            this.element.querySelector(".pagetitle").textContent = offer.name;

            this.setProductOffers(offer.productOffers.productOffer);
        },

        /**
        * Sets the candyRack Offers
        */
        setProductOffers: function (productOffers) {
            var self = this;
            if (productOffers) {
                productOffers.forEach(function (productOffer) {
                    // Try to show the offerImage, if it doesn't exists show the producImage
                    if (!productOffer.image) {
                        productOffer.image = productOffer.product.productImage;
                    }
                    self._listItems.push(productOffer);
                });
            }
        },

        /**
         * Default behaviour when a candy rack offer is clicked
         */
        _onItemClicked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                item.data.product.pricing = item.data.pricing;
                item.data.product.addProductToCart = item.data.addProductToCart
                self._doItemSelected(item, true);
            });
        },

        /**
         * Dispathches the event when an item is selected
         * @item the Item selected
         * @fullVersion defines if the item selected has all the data on it, or only the id, so if you need to show other product info you'll need to call the product service to get it
         */
        _doItemSelected: function (item, fullVersion) {
            if (item.data.product) {
                this.dispatchEvent(this.events.ITEM_SELECTED, { item: item.data.product, "fullVersion": fullVersion });
            }
        },

        /**
         * Behaviour the an items is selected from the list
         */
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

        /**
          * Default behaviour when add products to cart is called.
          */
        _onAddOfferToCart: function () {
            var self = this;
            var selectedItems = [];

            // Builds a list with the items currently selected
            this.itemsList.selection.getItems().then(function (items) {
                items.forEach(function (item) {
                    selectedItems.push({ product: item.data.product, qty: 1, addToCartUri: item.data.addProductToCart.uri });
                });
                if (selectedItems.length > 0) {
                    self.dispatchEvent(self.events.ADD_OFFER_CLICKED, selectedItems);
                }
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

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.addCommand({ id: 'cmdAdd', label: addButtonLabel, icon: 'add', section: 'selection', tooltip: addButtonTooltip, hidden: true, clickHandler: this._onAddOfferToCart.bind(this) });

            this.topAppBar = DR.Store.App.AppTopBar.winControl;
        },

        /**
        * Clears the current selected items from the list
        */
        clearSelection: function () {
            this.itemsList.selection.clear();
        },

        unload: function () {
            this.setOffer = function (offer) {
            };
        }

    });

    /**
     * Renders the special Offers
     */
    function renderItems(itemPromise) {
        var self = this;
        var template = this._itemTemplate;
        return itemPromise.then(function (currentItem) {
            setofferPricing(currentItem.data);
            return template.render(currentItem.data);
        });
    }

    /**
     * Sets the offer oldPrice in order to define show it or not
     */
    function setofferPricing(offer) {
        if (offer.pricing.formattedListPrice != offer.pricing.formattedSalePriceWithQuantity) {
            offer.pricing.oldPrice = offer.pricing.formattedListPrice;
        } else {
            offer.pricing.oldPrice = null;
        }
    }

})();
