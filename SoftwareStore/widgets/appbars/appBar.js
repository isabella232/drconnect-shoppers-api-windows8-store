/**
 * Generic AppBar. All html must have and appBar with a class defined "appBar". So this class can get the winControl Looking for that bar
 */
(function () {
    "use strict";

    /**
     * Builds The appBar
     * controlFileName is the name of the html file that contains the appBar control (without html extension)
     * selectionCommands is a list of the commands that must be shown or hidden when a list selecion occurs (empty if there are no commands)
     */
    function _buildBottomAppBar(controlFileName, selectionCommands) {
        var uri = "/widgets/appbars/" + controlFileName + ".html";
        var appBarClass = ".appBar";
        return WinJS.UI.Pages.define(uri, {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                // TODO: Initialize the page here.
                this.appBar = element.querySelector(appBarClass).winControl;
                this.hideSelectionCommands();
            },

            /**
             * Shows The AppBar
             */
            show: function () {
                // Show selection commands in AppBar
                this.showSelectionCommands()
                this.appBar.sticky = true;
                this.appBar.show();
            },

            /**
             * Hides The AppBar
             */
            hide: function () {
                // Hide selection commands in AppBar
                this.hideSelectionCommands();
                this.appBar.hide();
                this.appBar.sticky = false;
            },

            /**
             * Shows the selectionCommands if defined (those ones that are show when items are selected)
             */
            showSelectionCommands: function () {
                var self = this;
                if (selectionCommands) {
                    selectionCommands.forEach(function (command) {
                        self.appBar.showCommands(self.element.querySelector(command));
                    });
                }
            },

            /**
            * Hides the selectionCommands if defined (those ones that are show when items are selected)
            */
            hideSelectionCommands: function () {
                var self = this;
                if (selectionCommands) {
                    selectionCommands.forEach(function (command) {
                        self.appBar.hideCommands(self.element.querySelector(command));
                    });
                }
            },

            unload: function () {
             },

            updateLayout: function (element, viewState, lastViewState) {
                /// <param name="element" domElement="true" />
            }
        });
    }
   
    WinJS.Namespace.define("DR.Store.Widget.AppBar", {
        BottomHomeAppBar: _buildBottomAppBar("bottomHomeAppBar", ["#cmdAdd"]),
        TopHomeAppBar: _buildBottomAppBar("topHomeAppBar")
    });
})();
