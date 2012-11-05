(function () {
    "use strict";
    /**
     * Control that contains a ComboBox and a Detail panel for the selected value in the combo
     */
    var Class = WinJS.UI.Pages.define("/widgets/html/comboList/PaymentOptionListWidget.html", {

        // Combo List Widget Helper
        _comboListHelper: null,
        ready: function (element, options) {
            var listElement = element.querySelector(".payment-combo-options");
            var detailTemplate = element.querySelector("#paymentDetailTemplate").winControl;
            var detailElement = element.querySelector(".payment-tile");
            this._comboListHelper = new DR.Store.Widget.Html.ComboListWidgetHelper(this.element, listElement, detailElement, detailTemplate,
                this._getSelectedItemFromList.bind(this));
        },

        /**
         * Sets the list of values of the combobox
         */ 
        setList: function (list, selectedValue) {
            this._comboListHelper.setList(list, selectedValue);
        },

        /**
         * Gets the selectedItem from the list
         */
        getSelectedItem: function () {
            return this._comboListHelper.getSelectedItem();
        },

        /**
         * Sets a Particular Value of the comboBox 
         */
        setValue: function(value){
            this._comboListHelper.setValue(value);
        },
      
        /**
         * Gets the selected index and value from the list making a comparison between the elements from the list and the value passed as parameter
         * @value the selected value
         */
        _getSelectedItemFromList: function (value) {
            var list = this._comboListHelper.getList();
            if (value.nickName) {
                var index = _getIndexForValue(list, value);
                return {
                    "index": index,
                    "value": value
                }
            } else {
                return _getSelectedPaymentFromList(list, value);
            }
        }

    });

    /**
	 * Determines if a payment is equal to another payment. 
	 */
    function paymentEquals(payment1, payment2) {
        return ((payment1.name == payment2.type || !payment1.name && !payment2.type) &&
                 (payment1.expirationMonth == payment2.expirationMonth || !payment1.expirationMonth && !payment2.expirationMonth) &&
                 (payment1.expirationYear == payment2.expirationYear || !payment1.expirationYear && !payment2.expirationYear));
      
    }

    /**
     * Gets the index on the list of the value parameter comparing the payment id
     */
    function _getIndexForValue(list, value) {
       list.forEach(function (item, index) {
            if (item.id === value.id) return index;
            else return -1;
        });
    }

    /**
     * Gets the selected payment from the list comparing it with the setted in the cart
     * For the comparison tries to match all the fields of the payment
     */
    function _getSelectedPaymentFromList(list, value) {
        for (var i = 0; i < list.length; i++) {
            var payment = list[i];
            if (paymentEquals(value, payment.creditCard)) {
                var result = {}
                result.value = payment;
                result.index = i;
                return result;
                break;
            }
        }
    }

    WinJS.Namespace.define("DR.Store.Widget.Html", {
        PaymentOptionListWidget: Class
    });


})();
