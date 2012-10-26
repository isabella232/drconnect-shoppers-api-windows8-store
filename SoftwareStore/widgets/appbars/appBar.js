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
            _commands: [],
            _defaultCommands: [],
            _defaultRightCommands: [],
            ready: function (element, options) {
                if (!this.appBar) {
                    this.appBar = element.querySelector(appBarClass).winControl;
                }

            },

            /**
             * Adds a default command (shown among all views) to the appbar that will be shown in all pages
             * options should include all data-win-options and an additional key called clickHandler
             */ 
            addDefaultCommand: function (options) {
                this.addCommand(options, true);
            },

            /**
             * Adds a commands to the appbar that will be shown in all pages
             * options should include all data-win-options and an additional key called clickHandler
             */
            addDefaultCommands: function (commands) {
                this.addCommands(commands, true);
            },

            /**
             * Adds a command to the appbar
             * options should include all data-win-options and an additional key called clickHandler
             * isDefault indicates if it is a default command (persist among different views) If not informed = false
             */ 
            addCommand: function (options, isDefault) {
                // If appBar is undefined define it
                if (!this.appBar) {
                    this.appBar = this.element.querySelector(appBarClass).winControl;
                }
                var button = new WinJS.UI.AppBarCommand(null, options);
                button.onclick = options.clickHandler;
                this.appBar.element.appendChild(button.element);
                // If it's not a default command adds it to the commandIds list used then for the clear function
                if (!isDefault) {
                    this._redrawDefaultButtons();
                    this._commands.push(button);
                } else {
                    // If its a defaultCommand adds it to a list in order to unhide them on the clear function
                    this._defaultCommands.push(button);

                    // If the command is default and is on the right section of the AppBar, adds it to the _defaultRightCommands list, in order to
                    // to show them on the correct order
                    if (options.section && options.section == "global") {
                        this._defaultRightCommands.push(button);
                    }
                }
            },

            /**
             * Adds commands to the appbar
             * options should include all data-win-options and an additional key called clickHandler
             * isDefault indicates if it is a default command (persist among different views) If not informed = false
             */
            addCommands: function (commands, isDefault) {
                var self = this;
                commands.forEach(function (command) {
                    self.addCommand(command, isDefault);
                });
            },

            /**
             * Removes a non default command from the appBar (it does not remove it from the list)
             */ 
            _removeCommand: function (command) {
                var self = this;
                var c;
                for (var i = 0; i < this._commands.length; i++){
                    c = this._commands[i];
                    if (c.id === command.id) {
                        self.appBar.element.removeChild(command.element);
                        break;
                    }
                }
            },

            /**
             * Redraws the right default buttons so they can be shown ordered and at the end of the right buttons
             */
            _redrawDefaultButtons: function () {
                var self = this;
                // For Each default command removes the element and add it again in order to be rendered at the last position
                this._defaultRightCommands.forEach(function (command) {
                    self._redrawDefaultButton(command);
                });
            },

            /**
             * Removes and then adds a button to the appBar in order to render the button as the last One
             */
            _redrawDefaultButton: function (command) {
                this.appBar.element.removeChild(command.element);
                this.appBar.element.appendChild(command.element);
            },

            /**
            * Removes all non default commands existent on the appBar
            * Unhides the defaultCommands
            */
            clear: function () {
                var self = this;
                this._commands.forEach(function (command) {
                    self._removeCommand(command);
                });
                // Empty the commandIds list
                this._commands = [];

                // Unhide the default commands
                this._defaultCommands.forEach(function (command) {
                    if (command.hidden) {
                        self.showCommands([command.id]);
                    }
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
                        self.appBar.showCommands(command);
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
                        self.appBar.hideCommands(command);
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
