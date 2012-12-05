// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/checkout/checkout.html", {
        events: {
            ITEM_SELECTED: "itemSelected",
            SUBMIT_CLICKED: "submitClicked",
            SHIPPING_ADDRESS_CHANGED: "shippingAddressChanged",
            SHIPPING_OPTION_CHANGED: "shippingOptionChanged"
        },

        ready: function (element, options) {
            this.itemsList = this.element.querySelector("#cartlist").winControl;
            this.itemsList.itemTemplate = element.querySelector('#cartTemplate');
            this.itemsList.layout = new WinJS.UI.ListLayout();
            this.itemsList.oniteminvoked = this._onCartItemClicked.bind(this);

            // Set the widgets
            this._billingAddressWidget = this.element.querySelector("#billingAddress").winControl;
            this._shippingAddressWidget = this.element.querySelector("#shippingAddress").winControl;
            this._paymentOptionWidget = this.element.querySelector("#paymentOption").winControl;
            this._shippingMethodWidget = this.element.querySelector("#shippingMethod").winControl;

            // adds Handlers for shipping address and methods
            var shippingAddressCombo = this.element.querySelector("#shippingAddress").querySelector(".address-combo-options");
            shippingAddressCombo.addEventListener("change", this._onShippingAddressChanged.bind(this), false);

            var shippingOptionCombo = this.element.querySelector("#shippingMethod").querySelector(".shipping-combo-options");
            shippingOptionCombo.addEventListener("change", this._onShippingOptionChanged.bind(this), false);

            // Gets the checkout button
            var submitButton = this.element.querySelector("#submitButton");
            submitButton.onclick = this._onSubmitClicked.bind(this);

        },

        _cart: null,
        _addresses: null,
        _paymentOptions: null,
        _billingAddressWidget: null,
        _shippingAddressWidget: null,
        _paymentOptionWidget: null,
        _shippingMethodWidget: null,
        _selectedPaymentOption: null,
        _selectedBillingAddress: null,
        _selectedShippingAddress: null,
        _selectedShippingMethod: null,

        /**
         * Sets the cart
         * @skipSetAddressAndPayment defines if addresses and payment should be set or now (by default always is set) Useful when shipping method is changed
         *
         */
        setCart: function (cart) {
            this._cart = cart;

            this.element.querySelector("#summary").winControl.renderPricing(cart.pricing);

            var cartlist = new WinJS.Binding.List();
            this.itemsList.itemDataSource = cartlist.dataSource;
            var items = cart.lineItems.lineItem;
            items.forEach(function (item) {
                cartlist.push(item);
            });

         
            // If addresses are seted then set de selected address for the cart
            if (this._addresses) {
                this._billingAddressWidget.setValue(cart.billingAddress);
                this._shippingAddressWidget.setValue(cart.shippingAddress);

                // Sets the currentBilling and shipping address in order to decide if apply shopper is needed before submitting the cart
                this._selectedBillingAddress = this._billingAddressWidget.getSelectedItem();
                this._selectedShippingAddress = this._shippingAddressWidget.getSelectedItem();
            }
            if (this._paymentOptions) {
                this._paymentOptionWidget.setValue(cart.payment);
                // Sets the currentPaymentOption in order to decide if apply shopper is needed before submitting the cart
                this._selectedPaymentOption = this._paymentOptionWidget.getSelectedItem();
            }
            
            this._setShippingMethod(cart);


        },

        /**
         * Sets the address List
         */
        setAddresses: function (addresses) {
            this._addresses = addresses;
            var selectedBillingAddress = null;
            var selectedShippingAddress = null;
            if (this._cart) {
                selectedBillingAddress = this._cart.billingAddress;
                selectedShippingAddress = this._cart.shippingAddress;
            }

            this._billingAddressWidget.setList(addresses.address, selectedBillingAddress);
            this._shippingAddressWidget.setList(addresses.address, selectedShippingAddress);

            // Sets the currentBilling and shipping address in order to decide if apply shopper is needed before submitting the cart
            this._selectedBillingAddress = this._billingAddressWidget.getSelectedItem();
            this._selectedShippingAddress = this._shippingAddressWidget.getSelectedItem();
        },

        /**
         * Sets the payment options
         */
        setPaymentOptions: function (paymentOptions) {
            this._paymentOptions = paymentOptions;
            var selectedPayment = null;
            if (this._cart)
                selectedPayment = this._cart.payment;
            this._paymentOptionWidget.setList(paymentOptions.paymentOption, selectedPayment);

            // Sets the currentPaymentOption in order to decide if apply shopper is needed before submitting the cart
            this._selectedPaymentOption = this._paymentOptionWidget.getSelectedItem();

        },

        /**
         * Sets the Shipping Method
         */
        _setShippingMethod: function (cart) {
            if (!cart.shippingMethod.code) {
                this.element.querySelector("#shippingMethodEmpty").textContent = WinJS.Resources.getString("checkout.shippingMethodNotRequired").value;
                WinJS.Utilities.addClass(this.element.querySelector("#shippingMethod"), "hidden");
            } else {
                var selectedShipping = null;
                if (cart.shippingMethod.code)
                    selectedShipping = cart.shippingMethod;
                this._shippingMethodWidget.setList(cart.shippingOptions.shippingOption, selectedShipping);

                // Sets the currentPaymentOption in order to decide if apply shopper is needed before submitting the cart
                this._selectedShippingMethod = this._shippingMethodWidget.getSelectedItem();
                WinJS.Utilities.removeClass(this.element.querySelector("#shippingMethod"), "hidden");
            }

        },

        /**
         * Behaviour when submit button is clicked
         */
        _onSubmitClicked: function (e) {
            // Build the parameters of the selected addresses if correspond
            var params = {};
            if (this._selectedBillingAddress.id != this._billingAddressWidget.getSelectedItem().id) {
                params.billingAddressId = this._billingAddressWidget.getSelectedItem().id;
            }
            if (this._selectedShippingAddress.id != this._shippingAddressWidget.getSelectedItem().id) {
                params.shippingAddressId = this._shippingAddressWidget.getSelectedItem().id;
            }
            if (this._selectedPaymentOption.id != this._paymentOptionWidget.getSelectedItem().id) {
                params.paymentOptionId = this._paymentOptionWidget.getSelectedItem().id;
            }

            params.cart = this._cart;

            this.dispatchEvent(this.events.SUBMIT_CLICKED, params);
        },

        /**
         * Behaviour when shippingAddress changes
         */
        _onShippingAddressChanged: function (event) {
            var params = {};

            if (this._selectedBillingAddress.id != this._billingAddressWidget.getSelectedItem().id) {
                params.billingAddressId = this._billingAddressWidget.getSelectedItem().id;
            }

            if (this._selectedPaymentOption.id != this._paymentOptionWidget.getSelectedItem().id) {
                params.paymentOptionId = this._paymentOptionWidget.getSelectedItem().id;
            }
            params.shippingAddressId = this._shippingAddressWidget.getSelectedItem().id;
            this.dispatchEvent(this.events.SHIPPING_ADDRESS_CHANGED, params);
        },

        /**
         * Behaviour when shippingOption changes
         */
        _onShippingOptionChanged: function (event) {
          
            var shippingOptionId = this._shippingMethodWidget.getSelectedItem().id;
            this.dispatchEvent(this.events.SHIPPING_OPTION_CHANGED, shippingOptionId);
        },

        /**
        * Default behaviour when a cart item is clicked
        */
        _onCartItemClicked: function (e) {
            var self = this;
            e.detail.itemPromise.then(function (item) {
                if (item.data.product) {
                    self.dispatchEvent(self.events.ITEM_SELECTED, { item: item.data.product });
                }
            });
        },

        blockUI: function(){

        },

        unload: function () {
            // When unloading change the setCart, setAddresses and setPaymentOptions function in order to avoid failing if the callback returns
            this.setCart = function (cart) {
            };

            this.setAddresses = function (addresses) {
            };

            this.setPaymentOptions= function (paymentOptions) {
            }
        }

    });

   
})();
