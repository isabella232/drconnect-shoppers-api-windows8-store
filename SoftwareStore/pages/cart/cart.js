(function () {
    /*
    if (Windows.ApplicationModel.DesignMode) {
        var cartitems = {
            "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/CartsResource",
            "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/carts\/active",
            "id": 12616335842,
            "lineItems": {
                "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/LineItemsResource",
                "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/carts\/active\/line-items",
                "lineItem": [
                    {
                        "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/LineItemsResource",
                        "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/carts\/active\/line-items\/12861215142",
                        "id": 12861215142,
                        "quantity": 2,
                        "product": {
                            "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/ProductsResource",
                            "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/products\/248217400",
                            "id": 248217400,
                            "displayName": "Photo Editor",
                            "thumbnailImage": "http:\/\/drh1.img.digitalriver.com\/DRHM\/Storefront\/Company\/aqued\/images\/product\/thumbnail\/80x80photo.png"
                        },
                        "pricing": {
                            "listPrice": {
                                "currency": "USD",
                                "value": 3.00
                            },
                            "listPriceWithQuantity": {
                                "currency": "USD",
                                "value": 6.00
                            },
                            "salePriceWithQuantity": {
                                "currency": "USD",
                                "value": 5.40
                            },
                            "formattedListPrice": "$3.00",
                            "formattedListPriceWithQuantity": "$6.00",
                            "formattedSalePriceWithQuantity": "$5.40"
                        }
                    }
                ]
            },
            "billingAddress": {
                "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/AddressesResource",
                "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/carts\/active\/billing-address"
            },
            "shippingAddress": {
                "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/AddressesResource",
                "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/carts\/active\/shipping-address"
            },
            "payment": null,
            "shippingMethod": {
                "code": null,
                "description": null
            },
            "shippingOptions": {
                "relation": "http:\/\/developers.digitalriver.com\/v1\/shoppers\/ShippingOptionsResource",
                "uri": "https:\/\/api.digitalriver.com\/v1\/shoppers\/me\/shipping-options"
            },
            "pricing": {
                "subtotal": {
                    "currency": "USD",
                    "value": 5.40
                },
                "discount": {
                    "currency": "USD",
                    "value": "0.54"
                },
                "shippingAndHandling": {
                    "currency": "USD",
                    "value": "0.00"
                },
                "tax": {
                    "currency": "USD",
                    "value": "0.00"
                },
                "orderTotal": {
                    "currency": "USD",
                    "value": 4.86
                },
                "formattedSubtotal": "$5.40",
                "formattedDiscount": "$0.54",
                "formattedShippingAndHandling": "$0.00",
                "formattedTax": "$0.00",
                "formattedOrderTotal": "$4.86"
            }
        };
    
        var cartlist = WinJS.Binding.List();
        cart.lineItem.lineItem.forEach(function (item) {
            cartlist.push(item);
        });
    }
    */
    WinJS.UI.Pages.define("/pages/cart/cart.html", {
        events: {
            ITEM_SELECTED: "itemSelected"
        },
        itemsList: null,
        cartContent: null,
        emptyMessage: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.itemsList = this.element.querySelector("#cartlist").winControl;
            this.itemsList.itemTemplate = element.querySelector('#cartTemplate');
            this.itemsList.layout = new WinJS.UI.ListLayout();

            this.itemsList.oniteminvoked = this._onCartItemClicked.bind(this);
            
            this.cartContent = this.element.querySelector(".cart-list-container");
            this.emptyMessage = this.element.querySelector(".cart-empty");

            WinJS.Utilities.addClass(this.cartContent, "hidden");
            WinJS.Utilities.addClass(this.emptyMessage, "hidden");
           
        },
        clear: function () {
            this.element.querySelector("#cart-subtotal").textContent = "";
            this.element.querySelector("#cart-tax").textContent = "";
            this.element.querySelector("#cart-total").textContent = "";
        },
        /**
         * Sets the cart and renders it
         */
        setCart: function (cart) {
            var items = cart.lineItems.lineItem;

            if (!items) {
                WinJS.Utilities.removeClass(this.emptyMessage, "hidden");
                return;
            }
            
            this.element.querySelector("#cart-subtotal").textContent = cart.pricing.formattedSubtotal;
            this.element.querySelector("#cart-tax").textContent = cart.pricing.formattedTax;
            this.element.querySelector("#cart-total").textContent = cart.pricing.formattedOrderTotal;
            this._setCartItems(items);

            WinJS.Utilities.removeClass(this.cartContent, "hidden");
        },
        _setCartItems: function (items) {
            var cartlist = new WinJS.Binding.List();
            this.itemsList.itemDataSource = cartlist.dataSource;
            items.forEach(function (item) {
                cartlist.push(item);
            });
        },

        _onCartItemClicked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                if (item.data.product) {
                    self.dispatchEvent(self.events.ITEM_SELECTED, { item: item.data.product });
                }
            });

        }

    });

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