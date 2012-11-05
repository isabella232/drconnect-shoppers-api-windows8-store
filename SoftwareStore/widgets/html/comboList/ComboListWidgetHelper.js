(function () {
    "use strict";

    /**
     * Helper Class that manages a ComboList Widget (contains a combo and a description section)
     * Controls the selection change for update the description
     * Also fills the combo with the values of a list
     */
    var Class = DR.Class.extend(
        /**
         * Constructor
         * @element DOM Element containing the controls
         * @getSelectedItemFromListFunction Function that receives a value returns a json with the item of the list that matches with the parameter 
         *      and the selected index on the list {index: <index of the list>, value: <value of the list>}
         */
        function (element, comboElement, detailElement, detailTemplate, getSelectedItemFromListFunction) {
            this._element = element;
            this._getSelectedItemFromList = getSelectedItemFromListFunction;
            this.initialize(comboElement, detailElement, detailTemplate)

        },
        {
            // DOM Element that contains the controls (combo and description)
            _element: null,
            // Function that returns the item of the list that matches the value parameter
            _getSelectedItemFromList: null,

            // List that contains the elements on the combobox
            _list: null,
            // Detail Template
            _detailTemplate: null,
            // Combo Element
            _listElement: null,
            // Detail Element where the Template will be rendered
            _detailElement: null,

            /**
             * Initializes the controls
             */
            initialize: function (comboElement, detailElement, detailTemplateElement) {
                this._listElement = comboElement;
                this._listElement.addEventListener("change", this._onValueChanged.bind(this), false);
                this._detailTemplate = detailTemplateElement;
                this._detailElement = detailElement;
            },

            /**
             * Sets the list and fills the combo control
             */
            setList: function (list, selectedValue) {
                this._list = list;
                fillComboWithValues(this._listElement, this._list);
                if (selectedValue) {
                    this.setValue(selectedValue)
                }
            },

            /**
             * Returns the list of elements
             */
            getList: function () {
                return this._list;
            },

            /**
             * Get SelectedItem
             */

            getSelectedItem: function () {
                if (this._listElement.selectedIndex >= 0) {
                    return this._list[this._listElement.selectedIndex];
                }
                else return null;
            },

            /**
             * Sets the combo with the value passed as parameter and updates the description
             */
            setValue: function (value) {
                var item = this._getSelectedItemFromList(value);
                this._listElement.selectedIndex = item.index;
                this.updateDetail(item.value);
            },

            /**
             * Behaviour when the combo value changes updating the details
             */
            _onValueChanged: function (args) {
                var value = this._list[args.target.selectedIndex];
                this.updateDetail(value);
            },

            /**
             * Updates the detail matching with the value selected on the combo
             */
            updateDetail: function (selectedItem) {
                var self = this;
                WinJS.Utilities.empty(this._detailElement);
                this._detailTemplate.render(selectedItem, this._detailElement);
            },

        });
       
    /**
     * Fills the combobox with values
     */
    function fillComboWithValues(comboElement, values, selectedValue) {
        var html;
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.text = value.nickName;
            comboElement.add(option);
        });
        comboElement.selectedIndex = -1;
    }

    WinJS.Namespace.define("DR.Store.Widget.Html", {
        ComboListWidgetHelper: Class
    });


})();
