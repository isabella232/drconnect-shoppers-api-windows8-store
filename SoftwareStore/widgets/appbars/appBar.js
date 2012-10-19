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
            appBar: null,
            // Commands that will be removed when clear funcion is called
            _commandIds: [],
            ready: function (element, options) {
                if (!this.appBar) {
                    this.appBar = element.querySelector(appBarClass).winControl;
                }

            },

            /**
             * Adds a command to the appbar that will be shown in all pages
             * options should include all data-win-options and an additional key called clickHandler
             */ 
            addDefaultCommand: function (options) {
                // If appBar is undefined define it
                if (!this.appBar) {
                    this.appBar = this.element.querySelector(appBarClass).winControl;
                }
                var button = new WinJS.UI.AppBarCommand(null, options);
                button.onclick = options.clickHandler;
                this.appBar.element.appendChild(button.element);
            },

            /**
             * Adds a commands to the appbar that will be shown in all pages
             * options should include all data-win-options and an additional key called clickHandler
             */
            addDefaultCommands: function (commands) {
                var self = this;
                commands.forEach(function (command) {
                    self.addCommand(command.options);
                });
            },

            /**
             * Removes all non default commands existent on the appBar
             */
            clear: function () {
                var self = this;
                this._commandIds.forEach(function (commandId) {
                    self.removeCommand(commandId);
                });
                // Empty the commandIds list
                this._commandIds = [];
            },

            /**
             * Adds a command to the appbar
             * options should include all data-win-options and an additional key called clickHandler
             */ 
            addCommand: function (options) {
                // If appBar is undefined define it
                if (!this.appBar) {
                    this.appBar = this.element.querySelector(appBarClass).winControl;
                }
                var button = new WinJS.UI.AppBarCommand(null, options);
                button.onclick = options.clickHandler;
                this.appBar.element.appendChild(button.element);
                this._commandIds.push(options.id);
            },

            /**
             * Adds commands to the appbar
             * options should include all data-win-options and an additional key called clickHandler
             */
            addCommands: function (commands) {
                var self = this;
                commands.forEach(function (command) {
                    self.addCommand(command);
                });
            },

            removeCommand: function(commandId){
                this.appBar.element.removeChild(this.appBar.element.querySelector(commandId));
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
        BottomAppBar: _buildAppBar("AppBar"),
        TopAppBar: _buildAppBar("TopAppBar")
    });
})();
