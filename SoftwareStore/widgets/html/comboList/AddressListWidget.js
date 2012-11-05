(function () {
    "use strict";
    /**
     * Control that contains a ComboBox and a Detail panel for the selected value in the combo
     */
    var Class = WinJS.UI.Pages.define("/widgets/html/comboList/AddressListWidget.html", {

        // Combo List Widget Helper
        _comboListHelper: null,
        ready: function (element, options) {
            var listElement = element.querySelector(".address-combo-options");
            var detailTemplate = element.querySelector("#addressDetailTemplate").winControl;
            var detailElement = element.querySelector(".address-tile");
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
                return _getSelectedAddressFromList(list, value);
            }
        }

    });

    /**
	 * Determines if a adress is equal to another address. 
	 */
    function addressEquals(address1, address2){
        return ((address1.firstName == address2.firstName || !address1.firstName && !address2.firstName)&&
				(address1.lastName == address2.lastName || !address1.lastName && !address2.lastName)  &&
				(address1.companyName == address2.companyName || !address1.companyName && !address2.companyName) &&
      			(address1.line1 == address2.line1 || !address1.line1 && !address2.line1) &&
      			(address1.line2 == address2.line2 || !address1.line2 && !address2.line2) &&
      			(address1.line3 == address2.line3 || !address1.line3 && !address2.line3) &&
      			(address1.city == address2.city || !address1.city && !address2.city) &&
      			(address1.countrySubdivision == address2.countrySubdivision || address1.countrySubdivision && !address2.countrySubdivision) &&
      			(address1.postalCode == address2.postalCode || !address1.postalCode && !address2.postalCode) &&
      			(address1.country == address2.country || !address1.country && !address2.country) &&
      			(address1.countryName == address2.countryName || !address1.countryName && !address2.countryName) &&
      			(address1.phoneNumber == address2.phoneNumber || !address1.phoneNumber && !address2.phoneNumber) &&
      			(address1.countyName == address2.countyName || !address1.countyName && !address2.countyName));
      
    }

    /**
     * Gets the index on the list of the value parameter comparing the address nickName
     */
    function _getIndexForValue(list, value) {
       list.forEach(function (item, index) {
            if (item.id === value.id) return index;
            else return -1;
        });
    }

    /**
     * Gets the selected address from the list comparing it with the setted in the cart
     * For the comparison tries to match all the fields of the address
     */
    function _getSelectedAddressFromList(list, value) {
        for (var i = 0; i < list.length; i++) {
            var address = list[i];
            if (addressEquals(value, address)) {
                var result = {}
                result.value = address;
                result.index = i;
                return result;
                break;
            }
        }
    }

    WinJS.Namespace.define("DR.Store.Widget.Html", {
        AddressListWidget: Class
    });


})();
