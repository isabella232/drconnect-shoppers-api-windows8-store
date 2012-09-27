(function () {
    "use strict";

    if (Windows.ApplicationModel.DesignMode) {
        var cartitems = [
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
        ];

    
        var cartlist = new WinJS.BindingList(cartlist);
        WinJS.Namespace.define("CartData", {
            datasource: cartitems
        });

    }

    document.addEventListener("DOMContentLoaded", function (element, option) {
        WinJS.UI.processAll().then(function () {
            this.cartlist = element.querySelector("#carlist").winControl;
            this.cartlist.itemTemplate = element.querySelector(".cart-item-template");
            this.cartlist.datasource = CartData.datasource;
        });
    });
    

    WinJS.UI.Pages.define("/pages/category/category.html", {
        ready: function () {
            this.listView = 
        }
    });
}());