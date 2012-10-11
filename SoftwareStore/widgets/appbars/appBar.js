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
    function _buildAppBar(controlFileName) {
        var uri = "/widgets/appbars/" + controlFileName + ".html";
        var appBarClass = ".appBar";
        return WinJS.UI.Pages.define(uri, {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            appBar : null,
            ready: function (element, options) {
                // TODO: Initialize the page here.
                if (!this.appBar) {
                    this.appBar = element.querySelector(appBarClass).winControl;
                }

            },

            /**
             * Adds a command to the appbar
             */ 
            addCommand: function (options, clickHandler) {
                // If appBar is undefined define it
                if (!this.appBar) {
                    this.appBar = this.element.querySelector(appBarClass).winControl;
                }
                var button = new WinJS.UI.AppBarCommand(null, options);
                button.onclick = clickHandler;
                this.appBar.element.appendChild(button.element);
            },

            /**
             * Adds commands to the appbar
             */
            addCommands: function (commands) {
                var self = this;
                commands.forEach(function (command) {
                    self.addCommand(command.options, command.clickHandler);
                });
            },

            /**
             * Shows The AppBar
             */
            show: function () {
                this.appBar.sticky = true;
                this.appBar.show();
            },

            /**
             * Hides The AppBar
             */
            hide: function () {
                this.appBar.hide();
                this.appBar.sticky = false;
            },

            /**
             * Shows the selectionCommands passed as parameter
             */
            showCommands: function (commandIds) {
                var self = this;
                if (commandIds) {
                    commandIds.forEach(function (command) {
                        self.appBar.showCommands(self.appBar.getCommandById(command));
                    });
                }
            },

            /**
               * Hides the selectionCommands passed as parameter
               */
            hideCommands: function (commandIds) {
                var self = this;
                if (commandIds) {
                    commandIds.forEach(function (command) {
                        self.appBar.hideCommands(self.appBar.getCommandById(command));
                    });
                }
            },

        });
    }
   
    WinJS.Namespace.define("DR.Store.Widget.AppBar", {
        AppBar: _buildAppBar("AppBar"),
        TopAppBar: _buildAppBar("TopAppBar")
    });
})();
