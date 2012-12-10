(function () {
    WinJS.UI.Pages.define("/pages/cart/cart.html", {
        events: {
            ITEM_SELECTED: "itemSelected",
            REMOVE_ITEM_CLICKED: "removeItemClicked",
            RESET_CART_CLICKED: "resetCartClicked",
            CHECKOUT_CLICKED: "checkoutClicked",
            LINE_ITEM_QUANTITY_CHANGED: "lineItemQuantityChanged",
            ADD_OFFER_CLICKED: "addOfferClicked"
        },
        itemsList: null,
        candyRackList: null,
        cartContent: null,
        candyRackContent: null,
        emptyMessage: null,
        _checkoutButton: null,
        // Items list used to reset the cart if requested
        _cartItems: null,
        _candyRackItems: null,
        // This flag will be used to define when an item is being selecting and avoid the loop when cleaning the selection on other list
        _selectingItemFlag: false,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            // Set the cart items
            this.itemsList = this.element.querySelector("#cartlist").winControl;
            this.itemsList.itemTemplate = renderCartItem.bind(this);
            this.itemsList.layout = new WinJS.UI.ListLayout();
            this._cartItems = new WinJS.Binding.List();
            this.itemsList.itemDataSource = this._cartItems.dataSource;

            this.itemsList.oniteminvoked = this._onCartItemClicked.bind(this);
            this.itemsList.addEventListener("selectionchanged", this._itemSelected.bind(this));

            // Set the candyRack items
            this.candyRackList = this.element.querySelector("#candyRack").winControl;
            this.candyRackList.itemTemplate = renderCandyRackItem.bind(this);//element.querySelector('.candyRackItemtemplate').winControl;
            this.candyRackList.layout = new WinJS.UI.ListLayout();
            this._candyRackItems = new WinJS.Binding.List();
            this.candyRackList.itemDataSource = this._candyRackItems.dataSource;

            this.candyRackList.oniteminvoked = this._onOfferItemClicked.bind(this);
            this.candyRackList.addEventListener("selectionchanged", this._candyRackItemSelected.bind(this));
            
            this.cartContent = this.element.querySelector(".cart-list-container");
            this.candyRackContent = this.element.querySelector(".candyrack-container");
            this.emptyMessage = this.element.querySelector(".cart-empty");

            WinJS.Utilities.addClass(this.cartContent, "hidden");
            WinJS.Utilities.addClass(this.emptyMessage, "hidden");
           
            // Gets the checkout button
            this._checkoutButton = this.element.querySelector("#checkoutButton");
            this._checkoutButton.onclick = this._onCheckoutClicked.bind(this);

            this._initializeAppBars();
        },
        clear: function () {
            this.element.querySelector("#summary").winControl.clear();
        },
        /**
         * Sets the cart and renders it
         */
        setCart: function (cart) {
            var items = cart.lineItems.lineItem;

            // If there are no items, clears the cart page
            if (!items) {
                WinJS.Utilities.removeClass(this.emptyMessage, "hidden");
                this.clear();
                WinJS.Utilities.addClass(this.cartContent, "hidden");
                this._setCartItems([]);
                this._hideCheckoutButton();
                return;
            }
            
            this.element.querySelector("#summary").winControl.renderPricing(cart.pricing);
            this._setCartItems(items);

            WinJS.Utilities.removeClass(this.cartContent, "hidden");
            this._showCheckoutButton();

        },

        /**
         * Hides the checkout button (usefull when cart is empty)
         */
        _hideCheckoutButton: function (){
            WinJS.Utilities.addClass(this._checkoutButton, "hidden");
        },

        /**
         * Shows the checkout button (usefull when cart is empty)
         */
        _showCheckoutButton: function (){
            WinJS.Utilities.removeClass(this._checkoutButton, "hidden");
        },

        /**
         * Sets the cart items
         */
        _setCartItems: function (items) {
            var self = this;
            // Empty the list and populates it with the new items
            // We don't recrate the list calling a new WinJS.Binding.List because there is a bug on the 
            // when trying to re-render the items
            this._cartItems.splice(0, this._cartItems.length);
            items.forEach(function (item) {
                item.pricing.unitPrice = "$" + (item.pricing.salePriceWithQuantity.value / item.quantity).toFixed(2);
                self._cartItems.push(item);
            });
        },

        /**
         * Sets the candyRack Offers
         */
        setCandyRack: function (productOffers) {
            var self = this;
            // Empty the list and populates it with the new items
            // We don't recrate the list calling a new WinJS.Binding.List because there is a bug on the 
            // when trying to re-render the items
            this._candyRackItems.splice(0, this._candyRackItems.length);
            if (productOffers) {
                WinJS.Utilities.removeClass(this.candyRackContent, "hidden");
                productOffers.forEach(function (productOffer) {
                    // Try to show the offerImage, if it doesn't exists show the producImage
                    if (!productOffer.image) {
                        productOffer.image = productOffer.product.productImage;
                    }
                    self._candyRackItems.push(productOffer);
                });
            } else {
                // If there are no offers hides the candyRack
                WinJS.Utilities.addClass(this.candyRackContent, "hidden");
            }
        },

        /**
         * Default behaviour when a cart item is clicked
         */
        _onCartItemClicked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                self._doItemSelected(item);
            });
        },

        /**
         * Default behaviour when a candy rack offer is clicked
         */
        _onOfferItemClicked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                item.data.product.pricing = item.data.pricing;
                item.data.product.addProductToCart = item.data.addProductToCart
                self._doItemSelected(item, true);
            });
        },

        /**
         * Behaviour when view item button is clicked
         */
        _onViewItem: function (e) {
            var self = this;

            this.itemsList.selection.getItems().then(function (items) {
                self._doItemSelected(items[0]);
            });
        },

        /**
         * Behaviour when view offer button is clicked
         */
        _onViewOffer: function (e) {
            var self = this;

            this.candyRackList.selection.getItems().then(function (items) {
                items[0].data.product.pricing = items[0].data.pricing;
                items[0].data.product.addProductToCart = items[0].data.addProductToCart;
                self._doItemSelected(items[0], true);
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
          * Default behaviour when add products to cart is called.
          */
        _onAddOfferToCart: function () {
            var self = this;
            var selectedItems = [];

            // Builds a list with the items currently selected
            this.candyRackList.selection.getItems().then(function (items) {
                items.forEach(function (item) {
                    selectedItems.push({ product: item.data.product, qty: 1, addToCartUri: item.data.addProductToCart.uri });
                });
                if (selectedItems.length > 0) {
                    self.dispatchEvent(self.events.ADD_OFFER_CLICKED, selectedItems);
                }
            });
        },

        /**
        * Default behaviour when remove from cart button is clicked
        */
        _onRemoveItem: function (e) {
            var self = this;
            var selectedItems = [];

            // Builds a list with the items currently selected
            this.itemsList.selection.getItems().then(function (items) {
                items.forEach(function (item) {
                    selectedItems.push(item.data);
                });
                if (selectedItems.length > 0) {
                    self.dispatchEvent(self.events.REMOVE_ITEM_CLICKED, selectedItems);
                }
            });
        },

        /**
         * Default behaviour when remove from cart button is clicked
         */
        _onResetCart: function (e) {
            var self = this;
            var items = [];

            // Builds a list with the items currently selected
            
            this._cartItems.forEach(function (item) {
                items.push(item);
            });
            if (items.length > 0) {
                self.dispatchEvent(self.events.RESET_CART_CLICKED, items);
            }
            
        },

        /**
         * Behaviour when checkout button is clicked
         */
        _onCheckoutClicked: function (e) {
            this.dispatchEvent(this.events.CHECKOUT_CLICKED);
        },

        /**
         * Behaviour when a quantity on a cartItem has changed
         */
        _onValueChanged: function (e, currentItem) {
            this.dispatchEvent(this.events.LINE_ITEM_QUANTITY_CHANGED, { item: currentItem, quantity: e.target.value});
        },

        /**
         * Initializes the application bars
         */
        _initializeAppBars: function () {

            // Get the localized labels for the commands
            var removeButtonLabel = WinJS.Resources.getString('general.button.removeFromCart.label').value;
            var removeButtonTooltip = WinJS.Resources.getString('general.button.removeFromCart.tooltip').value;
            var viewItemButtonLabel = WinJS.Resources.getString('general.button.viewItem.label').value;
            var viewItemButtonTooltip = WinJS.Resources.getString('general.button.viewItem.tooltip').value;
            var resetCartButtonLabel = WinJS.Resources.getString('general.button.resetCart.label').value;
            var resetCartButtonTooltip = WinJS.Resources.getString('general.button.resetCart.tooltip').value;
            var addOfferButtonLabel = WinJS.Resources.getString('general.button.addOffer.label').value;
            var addOfferButtonTooltip = WinJS.Resources.getString('general.button.addOffer.tooltip').value;
            var viewOfferButtonLabel = WinJS.Resources.getString('general.button.viewOffer.label').value;
            var viewOfferButtonTooltip = WinJS.Resources.getString('general.button.viewOffer.tooltip').value;

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.addCommand({ id: 'cmdRemove', label: removeButtonLabel, icon: '', section: 'selection', tooltip: removeButtonTooltip, hidden: true, clickHandler: this._onRemoveItem.bind(this) });
            this.bottomAppBar.addCommand({ id: 'cmdViewItem', label: viewItemButtonLabel, icon: '', section: 'selection', tooltip: viewItemButtonTooltip, hidden: true, clickHandler: this._onViewItem.bind(this) });
            this.bottomAppBar.addCommand({ id: 'cmdAddOffer', label: addOfferButtonLabel, icon: 'add', section: 'selection', tooltip: addOfferButtonTooltip, hidden: true, clickHandler: this._onAddOfferToCart.bind(this) });
            this.bottomAppBar.addCommand({ id: 'cmdViewOffer', label: viewOfferButtonLabel, icon: '', section: 'selection', tooltip: viewOfferButtonTooltip, hidden: true, clickHandler: this._onViewOffer.bind(this) });
            //TODO: Remove the reset cart because the API doesn't work well removing multiple items. Add it when the API is fixed
            //this.bottomAppBar.addCommand({ id: 'cmdResetCart', label: resetCartButtonLabel, icon: '', section: 'global', tooltip: resetCartButtonTooltip, clickHandler: this._onResetCart.bind(this) });
            this.bottomAppBar.hideCommands(["gotoCart"]);
            
            this.topAppBar = DR.Store.App.AppTopBar.winControl;

            // Because this page is the cart page, hides the gotoCart button on the page header bar
            var pageHeaderBar = DR.Store.App.PageHeaderBar.winControl;
            pageHeaderBar.hideElement("#upper-cart");


        },

        /**
        * Behaviour the an item is selected from the list
        */
        _itemSelected: function (item, e) {
            if (!this._selectingItemFlag && this.candyRackList.selection.count() > 0) {
                this._selectingItemFlag = true;
                this.candyRackList.selection.clear();
                this._selectingItemFlag = false;
            }

            var count = this.itemsList.selection.count();
            if (count > 0) {
                this.bottomAppBar.showCommands(["cmdRemove", "cmdViewItem"]);
                // If an item is being selected i do nothing with the appbar, since it will be shown or hidden by the function that is selecting the item
                if (!this._selectingItemFlag) {
                    this.topAppBar.show();
                    this.bottomAppBar.show();
                }
            } else {
                // If an item is being selected i do nothing with the appbar, since it will be shown or hidden by the function that is selecting the item
                if (!this._selectingItemFlag) {
                    this.topAppBar.hide();
                    this.bottomAppBar.hide();
                }
                this.bottomAppBar.hideCommands(["cmdRemove", "cmdViewItem"]);
            }
        },

        /**
         * Behaviour the an item is selected from the list
         */
        _candyRackItemSelected: function (item, e) {
            if (!this._selectingItemFlag && this.itemsList.selection.count() > 0) {
                this._selectingItemFlag = true;
                this.itemsList.selection.clear();
                this._selectingItemFlag = false;
            }
            var count = this.candyRackList.selection.count();
            if (count > 0) {
                this.bottomAppBar.showCommands(["cmdAddOffer", "cmdViewOffer"]);
                // If an item is being selected i do nothing with the appbar, since it will be shown or hidden by the function that is selecting the item
                if (!this._selectingItemFlag) {
                    this.topAppBar.show();
                    this.bottomAppBar.show();
                }
            } else {
                // If an item is being selected i do nothing with the appbar, since it will be shown or hidden by the function that is selecting the item
                if (!this._selectingItemFlag) {
                    this.topAppBar.hide();
                    this.bottomAppBar.hide();
                }
                this.bottomAppBar.hideCommands(["cmdAddOffer", "cmdViewOffer"]);
            }
        },

        /**
         * Clears the current selected items from the list
         */
        clearSelection: function () {
            this.itemsList.selection.clear();
            this.candyRackList.selection.clear();
        },

        unload: function () {
            // When unloading change the setCart function in order to avoid failing if the callback returns
            this.setCart = function (cart) {
            };
            this.setCandyRack= function (productOffers) {
            };
        }


    });


    /**
     * Renders the cartItems
     */
    function renderCartItem(itemPromise) {
        var self = this;
        var template = this.element.querySelector('#cartTemplate').winControl;
        return itemPromise.then(function (currentItem) {
            return template.render(currentItem.data).then(function (element) {
                // Adds an event listener in order to handle the quantity combo change
                element.querySelector("#itemQuantitySelector").addEventListener("change", function (event) {
                    self._onValueChanged(event, currentItem);
                }, false);
                return element
            });
        });
    }

    /**
    * Renders the cartItems
    */
    function renderCandyRackItem(itemPromise) {
        var self = this;
        var template = this.element.querySelector('.candyRackItemtemplate').winControl;
        return itemPromise.then(function (currentItem) {
            return template.render(currentItem.data);
        });
    }

    /**
     * Functions to expose externally.
     * (e.g. Binding converters)
     */
    WinJS.Namespace.define("DR.Store.Pages.Cart", {
        quantityToIndex: WinJS.Binding.converter(function (qty) {
            return parseInt(qty) - 1;
        })
    });
}());