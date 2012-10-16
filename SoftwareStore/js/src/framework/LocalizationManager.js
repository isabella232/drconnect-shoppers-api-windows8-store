/**
 * Localization Manager. Used to handle localization
 */
(function () {
    "use strict";


    var Class = DR.Class.extend(
        function (i18nNamespace, defaultLocale) {
            this.namespace = i18nNamespace;
            this.currentLocale = i18nNamespace[defaultLocale];
        },
        {
            currentLocale: null,
            namespace: null,

            /**
             * Changes the currently used locale
             */
            setLocale: function (locale) {
                this.currentLocale = this.namespace[locale];
            },
            /**
             * Retrieves a message by key. Parameters can be used (template message)
             */
            getMessage: function (key, args) {
                var message = this.currentLocale[key];

                return (message) ? message : key;
            }
    });

    // EXPOSING THE CLASS

    WinJS.Namespace.define("DR.MVC", {
        LocalizationManager: Class
    });

})();