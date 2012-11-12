(function () {
    WinJS.UI.Pages.define("/pages/cart/cart.html", {
        events: {
            ITEM_SELECTED: "itemSelected",
            REMOVE_ITEM_CLICKED: "removeItemClicked",
            RESET_CART_CLICKED: "resetCartClicked",
            CHECKOUT_CLICKED: "checkoutClicked",
            LINE_ITEM_QUANTITY_CHANGED: "lineItemQuantityChanged"
        },
        itemsList: null,
        cartContent: null,
        emptyMessage: null,
        _checkoutButton: null,
        // Items list used to reset the cart if requested
        _cartItems: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            this.itemsList = this.element.querySelector("#cartlist").winControl;
            this.itemsList.itemTemplate = renderCartItem.bind(this);//element.querySelector('#cartTemplate');
            this.itemsList.layout = new WinJS.UI.ListLayout();
            this._cartItems = new WinJS.Binding.List();
            this.itemsList.itemDataSource = this._cartItems.dataSource;

            this.itemsList.oniteminvoked = this._onCartItemClicked.bind(this);
            this.itemsList.addEventListener("selectionchanged", this._itemSelected.bind(this));
            
            this.cartContent = this.element.querySelector(".cart-list-container");
            this.emptyMessage = this.element.querySelector(".cart-empty");

            WinJS.Utilities.addClass(this.cartContent, "hidden");
            WinJS.Utilities.addClass(this.emptyMessage, "hidden");
           
            // Gets the checkout button
            this._checkoutButton = this.element.querySelector("#checkoutButton");
            this._checkoutButton.onclick = this._onCheckoutClicked.bind(this);

            this._initializeAppBars();
        },
        clear: function () {
            this.element.querySelector("#cart-subtotal").textContent = "";
            this.element.querySelector("#cart-tax").textContent = "";
            this.element.querySelector("#cart-discount").textContent = "";
            this.element.querySelector("#cart-total").textContent = "";
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
            
            this.element.querySelector("#cart-subtotal").textContent = cart.pricing.formattedSubtotal;
            this.element.querySelector("#cart-tax").textContent = cart.pricing.formattedTax;
            this.element.querySelector("#cart-discount").textContent = cart.pricing.formattedDiscount;
            this.element.querySelector("#cart-total").textContent = cart.pricing.formattedOrderTotal;
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
                self._cartItems.push(item);
            });
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
         * Behaviour when view item button is clicked
         */
        _onViewItem: function (e) {
            var self = this;

            this.itemsList.selection.getItems().then(function (items) {
                self._doItemSelected(items[0]);
            });
        },

        /**
         * Dispathches the event when an item is selected
         */
        _doItemSelected: function (item) {
            if (item.data.product) {
                this.dispatchEvent(this.events.ITEM_SELECTED, { item: item.data.product });
            }
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
            var self = this;

            // Get the localized labels for the commands
            var removeButtonLabel = WinJS.Resources.getString('general.button.removeFromCart.label').value;
            var removeButtonTooltip = WinJS.Resources.getString('general.button.removeFromCart.tooltip').value;
            var viewItemButtonLabel = WinJS.Resources.getString('general.button.viewItem.label').value;
            var viewItemButtonTooltip = WinJS.Resources.getString('general.button.viewItem.tooltip').value;
            var resetCartButtonLabel = WinJS.Resources.getString('general.button.resetCart.label').value;
            var resetCartButtonTooltip = WinJS.Resources.getString('general.button.resetCart.tooltip').value;

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.addCommand({ id: 'cmdRemove', label: removeButtonLabel, icon: '', section: 'selection', tooltip: removeButtonTooltip, clickHandler: this._onRemoveItem.bind(this) });
            this.bottomAppBar.addCommand({ id: 'cmdViewItem', label: viewItemButtonLabel, icon: '', section: 'selection', tooltip: viewItemButtonTooltip, clickHandler: this._onViewItem.bind(this) });
            this.bottomAppBar.addCommand({ id: 'cmdResetCart', label: resetCartButtonLabel, icon: '', section: 'global', tooltip: resetCartButtonTooltip, clickHandler: this._onResetCart.bind(this) });
            this.bottomAppBar.hideCommands(["cmdRemove", "cmdViewItem","gotoCart"]);
            this.bottomAppBar.hideCommands(["cmdViewItem"]);
            
            this.topAppBar = DR.Store.App.AppTopBar.winControl;

            // Because this page is the cart page, hides the gotoCart button on the page header bar
            var pageHeaderBar = DR.Store.App.PageHeaderBar.winControl;
            pageHeaderBar.hideElement("#upper-cart");


        },

        /**
        * Behaviour the an item is selected from the list
        */
        _itemSelected: function (item) {
            var count = this.itemsList.selection.count();
            if (count > 0) {
                this.bottomAppBar.showCommands(["cmdRemove","cmdViewItem"]);
                this.topAppBar.show();
                this.bottomAppBar.show();
            } else {
                this.topAppBar.hide();
                this.bottomAppBar.hide();
                this.bottomAppBar.hideCommands(["cmdRemove", "cmdViewItem"]);
            }
        },

        /**
         * Clears the current selected items from the list
         */
        clearSelection: function () {
            this.itemsList.selection.clear();
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
     * Functions to expose externally.
     * (e.g. Binding converters)
     */
    WinJS.Namespace.define("DR.Store.Pages.Cart", {
        quantityToIndex: WinJS.Binding.converter(function (qty) {
            return parseInt(qty) - 1;
        })
    });
}());