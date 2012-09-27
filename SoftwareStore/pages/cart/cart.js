(function () {
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
    
        var cartlist = new WinJS.BindingList();
        cart.lineItem.lineItem.forEach(function (item) {
            cartlist.push(item);
        });
    }

    WinJS.UI.Pages.define("/pages/cart/cart.html", {
        events: {
            ITEM_SELECTED: "itemSelected"
        },
        itemsList: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            this.itemsList = this.element.querySelector(".cartlist").winControl;
            this.itemsList.itemTemplate = element.querySelector(".cart-item-template");

            this.itemsList.datasource = cartlist.datasource;
        }
    });
}());