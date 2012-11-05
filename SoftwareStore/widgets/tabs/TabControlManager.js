(function () {
    "use strict";
    /**
     * This class manages the tabs and the interaction beetween the tabs and panels
     */
    var Class = DR.Class.extend(
         /**
          * Constructor
          * @parentElement is the html element that the manager needs to control, this element contains the tab buttons and the panels
          */
         function (parentElement) {
             this.element = parentElement;
         },
         {
             element: null,
             tabsList: [],

             /**
              * Adds the tab to the controlled tabs list
              * @tabId id of the button
              * @tabPanelId panel shown when the button is clicked
              */
             addTab: function (tabId, tabPanelId) {
                 var tabDiv = this.element.querySelector(tabId);
                 var panelDiv = this.element.querySelector(tabPanelId);
                 this.tabsList.push({ tab: tabDiv, panel: panelDiv });
                 tabDiv.addEventListener("click", _onTabClicked.bind(this));
             },
             /**
              * Returns an Object representing the tab at index or undefined;
              */
             getTab: function (index) {
                 return (index < this.tabsList.length) ? this.tabsList[index] : undefined;
             },
             /**
              * shows the tab panel and highlights the selected tab; hides and unselects the others.
              * @return the tab or undefined
              */
             showTab: function (tabIndex) {
                 var tabControl = this.getTab(tabIndex);
                 if (tabControl) {
                     this.tabsList.forEach(function (t) {
                         WinJS.Utilities.removeClass(t.tab, 'selected');
                         _toggleTab(t.panel, false);
                     });
                     WinJS.Utilities.addClass(tabControl.tab, 'selected');
                     _toggleTab(tabControl.panel, true);
                 }
                 return tabControl;
             },

             removeTab: function (tabIndex) {
                 var tabControl = this.getTab(tabIndex);
                 if (tabControl) {
                     this.tabsList.splice(tabIndex, 1);
                 }
                 return tabControl;
             }
         }

    );

    /**
     * Handles the event when a tab header is clicked
     */
    function _onTabClicked(event) {
        var self = this;
        var target = event.target;
        this.tabsList.forEach(function (tabControl) {
            if (target.id != tabControl.tab.id) {
                // Hides the other tabs
                WinJS.Utilities.removeClass(tabControl.tab, 'selected');
                _toggleTab(tabControl.panel, false);
            } else {
                // If matches with the tab clicked shows the tab
                WinJS.Utilities.addClass(tabControl.tab, 'selected');
                _toggleTab(tabControl.panel, true);
            }
        });
    }

    /**
     * Hides or Shows the panel passed as parameter
     * @panel panel that needs to be shown or hidden
     * @visible true to show, false to hide
     */

    // TODO this should return a promise so that the transition can be animated.
    function _toggleTab(panel, visible){
        if (panel) {
            if (typeof visible === 'undefined') {
                visible = !panel.style.display === 'none';
            }
            panel.style.display = (visible ? 'block' : 'none');
        }
    }

    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.Store.Widget.Tabs", {
        TabControlManager: Class
    });

})();