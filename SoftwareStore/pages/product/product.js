// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    WinJS.UI.Pages.define("/pages/product/product.html", {
        events: {
            CART_BUTTON_CLICKED: "cartButtonClicked",
            ADD_TO_CART: "AddToCart",
            ITEM_SELECTED: "itemSelected",
            ADD_OFFER_CLICKED: "addOfferClicked"
          
        },
        images: new WinJS.Binding.List(),
        product: null,
        tabControl: null,
        // Special offers variables
        offersList: null,
        offersContent: null,
        _offersItems: null,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var oSelf = this;

            // TODO: Initialize the page here.
            var flipView = element.querySelector('#imageFlipView').winControl;
            flipView.itemTemplate = element.querySelector('#imageFlipViewTemplate');
            flipView.itemDataSource = this.images.dataSource;

            element.querySelector("#btnAddToCart").onclick = oSelf._onAddToCart.bind(oSelf);

            // Set the special Offers items
            this.offersList = this.element.querySelector("#specialOffers").winControl;
            this.offersList.itemTemplate = renderOffers.bind(this);
            this.offersList.layout = new WinJS.UI.ListLayout();
            this._offersItems = new WinJS.Binding.List();
            this.offersList.itemDataSource = this._offersItems.dataSource;

            this.offersList.oniteminvoked = this._onOfferItemClicked.bind(this);
            this.offersList.addEventListener("selectionchanged", this._offerItemSelected.bind(this));

            this.offersContent = this.element.querySelector(".offers-container");

            // Initializes the tabs
            this._initializeTabs();
            this._initializeAppBars();
            
        },
        clear: function() {
            this.product = null;
            this.images.splice(0, this.images.length);
            this.element.querySelector(".titlearea .pagetitle").textContent = "";
            this.element.querySelector(".short-description").innerHTML = "";
            this.element.querySelector("#snapped_description").innerHTML = "";
            this.element.querySelector(".long-description").innerHTML = "";
            this._clearPrices();
        },

        /**
         * Clears the prices content on the page
         */
        _clearPrices: function(){
            this.element.querySelector("#salePrice").textContent = "";
            WinJS.Utilities.addClass(this.element.querySelector("#listPriceLabel"), "hidden");
            WinJS.Utilities.addClass(this.element.querySelector("#savedAmountLabel"), "hidden");
            this.element.querySelector("#listPrice").textContent = "";
            this.element.querySelector("#savedAmount").textContent = "";

        },

        /**
         * Initialize the TabControlManager that controls the tabs
         */
        _initializeTabs: function(){
            this.tabControl = new DR.Store.Widget.Tabs.TabControlManager(this.element);
            this.tabControl.addTab("#overviewTab", '#overview_pane');
            this.tabControl.addTab("#detailsTab", '#details_pane');
        },

        _onAddToCart: function () {
            if(this.product) {
                this.dispatchEvent(this.events.ADD_TO_CART, { product: this.product, qty: "1" });
            }
        },

        /**
         * Sets the product name
         */
        setProductName: function(name) {
            this.element.querySelector(".titlearea .pagetitle").textContent = name;
        },

        /** 
         * Sets the product model
         */
        setProduct: function (product) {
            this.product = product;
            
            this.images.push(product);

            this.element.querySelector(".titlearea .pagetitle").textContent = product.displayName;
            this.element.querySelector("#salePrice").textContent = product.pricing.formattedSalePriceWithQuantity;
            this.element.querySelector(".content .short-description").innerHTML = window.toStaticHTML(product.shortDescription || "");
            this.element.querySelector("#snapped_description").innerHTML = window.toStaticHTML(product.shortDescription || "");
            this.element.querySelector(".content .long-description").innerHTML = window.toStaticHTML(product.longDescription || "");

            this.setPricing(product.pricing);

            this.showLoader(false);
        },

        /**
         * Sets the pricing on the page
         * Hide/show some fields depending on if there is a discount or not
         */
        setPricing: function (pricing) {
            if (pricing.listPrice.value != pricing.salePriceWithQuantity.value) {
                var savedAmount;
                // This if statement is applied because there is a bug on the offers api that retrieves the discount in null besides it should be a value different than 0
                if (pricing.totalDiscountWithQuantity) {
                    savedAmount = "$" + pricing.totalDiscountWithQuantity.value + " " + WinJS.Resources.getString('productDetail.saved').value;
                } else {
                    savedAmount = "$" + (pricing.listPrice.value - pricing.salePriceWithQuantity.value).toFixed(2) + " " + WinJS.Resources.getString('productDetail.saved').value;
                }
                this.element.querySelector("#listPrice").textContent = pricing.formattedListPrice;
                this.element.querySelector("#savedAmount").textContent = savedAmount;
                WinJS.Utilities.removeClass(this.element.querySelector("#listPriceLabel"), "hidden");
                WinJS.Utilities.removeClass(this.element.querySelector("#savedAmountLabel"), "hidden");
            }

            this.element.querySelector("#salePrice").textContent = pricing.formattedSalePriceWithQuantity;
        },

        /**
         * Sets the special Offers
         */
        setSpecialOffers: function (offers) {
            var self = this;
            // Empty the list and populates it with the new items
            // We don't recrate the list calling a new WinJS.Binding.List because there is a bug on the 
            // when trying to re-render the items
            this._offersItems.splice(0, this._offersItems.length);
            offers.offer.forEach(function (offer) {
                offer.productOffers.productOffer.forEach(function (productOffer) {
                    // Try to show the offerImage, if it doesn't exists show the producImage
                    if (!productOffer.image) {
                        productOffer.image = productOffer.product.productImage;
                    }
                    self._offersItems.push(productOffer);
                });
            });

            // Hides special offers section if there are not special offers
            if (self._offersItems.length > 0) {
                WinJS.Utilities.removeClass(this.offersContent, "hidden");
            } else {
                WinJS.Utilities.addClass(this.offersContent, "hidden");
            }

        },

        /**
         * Default behaviour when offer is clicked
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
         * Behaviour when view offer button is clicked
         */
        _onViewOffer: function (e) {
            var self = this;

            this.offersList.selection.getItems().then(function (items) {
                items[0].data.product.pricing = items[0].data.pricing;
                items[0].data.product.addProductToCart = items[0].data.addProductToCart;
                self._doItemSelected(items[0], true);
            });
        },

        /**
         * Dispathches the event when an offer item is selected
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
            this.offersList.selection.getItems().then(function (items) {
                items.forEach(function (item) {
                    selectedItems.push({ product: item.data.product, qty: 1, addToCartUri: item.data.addProductToCart.uri });
                });
                if (selectedItems.length > 0) {
                    self.dispatchEvent(self.events.ADD_OFFER_CLICKED, selectedItems);
                }
            });
        },

        /**
         * Behaviour the an item is selected from the list
         */
        _offerItemSelected: function (item, e) {
            var count = this.offersList.selection.count();
            if (count > 0) {
                this.bottomAppBar.showCommands(["cmdAddOffer"]);
                if (count == 1) {
                    this.bottomAppBar.showCommands(["cmdViewOffer"]);
                } else {
                    this.bottomAppBar.hideCommands(["cmdViewOffer"]);
                }
                this.topAppBar.show();
                this.bottomAppBar.show();
            } else {
                this.topAppBar.hide();
                this.bottomAppBar.hide();
                this.bottomAppBar.hideCommands(["cmdAddOffer", "cmdViewOffer"]);
            }
        },


        /**
        * Clears the current selected items from the list
        */
        clearSelection: function () {
            this.offersList.selection.clear();
        },
        
        /**
         * Initializes the application bars
         */
        _initializeAppBars: function () {

            // Get the localized labels for the commands
            var addOfferButtonLabel = WinJS.Resources.getString('general.button.addOffer.label').value;
            var addOfferButtonTooltip = WinJS.Resources.getString('general.button.addOffer.tooltip').value;
            var viewOfferButtonLabel = WinJS.Resources.getString('general.button.viewOffer.label').value;
            var viewOfferButtonTooltip = WinJS.Resources.getString('general.button.viewOffer.tooltip').value;

            // Initialize the Bottom AppBar
            this.bottomAppBar = DR.Store.App.AppBottomBar.winControl;
            this.bottomAppBar.addCommand({ id: 'cmdAddOffer', label: addOfferButtonLabel, icon: 'add', section: 'selection', tooltip: addOfferButtonTooltip, hidden: true, clickHandler: this._onAddOfferToCart.bind(this) });
            this.bottomAppBar.addCommand({ id: 'cmdViewOffer', label: viewOfferButtonLabel, icon: '', section: 'selection', tooltip: viewOfferButtonTooltip, hidden: true, clickHandler: this._onViewOffer.bind(this) });

            this.topAppBar = DR.Store.App.AppTopBar.winControl;
        },


        showLoader: function (show) {
            var progress = this.element.querySelector("progress");
            if (!progress) return;
            if (show) {
                WinJS.Utilities.removeClass(progress, "hidden");
            } else {
                WinJS.Utilities.addClass(progress, "hidden");
            }
        },

        unload: function () {
            // When unloading set the setProduct function in order to avoid failing if the callback returns
            this.setProduct = function (product) {
            };

            this.setSpecialOffers = function (offers) {
            };

        },

        // is called when the view is changed (rotated, snapped, etc.)
        updateLayout: function (element, viewState, lastViewState) {
            // Check to see if the application is in snapped view.
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    // force the overview tab to be shown. CSS hides the rest of the tabs.
                    this.tabControl.showTab("overviewTab");
                }
            }
        }
    });

    /**
     * Renders the special Offers
     */
    function renderOffers(itemPromise) {
        var self = this;
        var template = this.element.querySelector('.candyRackItemtemplate').winControl;
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
