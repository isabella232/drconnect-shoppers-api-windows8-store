(function () {
    "use strict";

    var cartitems = [
        {
            "quantity": 2,
            "product": {
                "displayName": "Photo Editor",
                "thumbnailImage": "http://drh1.img.digitalriver.com/DRHM/Storefront/Company/aqued/images/product/thumbnail/80x80photo.png"
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
        },
        {
            "quantity": 1,
            "product": {
                "displayName": "Photo Editor",
                "thumbnailImage": "http://drh1.img.digitalriver.com/DRHM/Storefront/Company/aqued/images/product/thumbnail/80x80photo.png"
            },
            "pricing": {
                "listPrice": {
                    "currency": "USD",
                    "value": 10.00
                },
                "listPriceWithQuantity": {
                    "currency": "USD",
                    "value": 10.00
                },
                "salePriceWithQuantity": {
                    "currency": "USD",
                    "value": 9.99
                },
                "formattedListPrice": "$10.00",
                "formattedListPriceWithQuantity": "$10.00",
                "formattedSalePriceWithQuantity": "$10.00"
            }
        }
    ];

    var cartlist = new WinJS.Binding.List(cartitems);
    WinJS.Namespace.define("CartData", {
        listData: cartlist
    });

    WinJS.UI.Pages.define("/pages/cart/cart.html", {
        ready: function (element, options) {
            this.itemsList = element.querySelector('.cartlist');
            this.itemsList.itemTemplate = element.querySelector('#cartTemplate');
            this.itemsList.layout = new WinJS.UI.ListLayout();
        }
    });

}());