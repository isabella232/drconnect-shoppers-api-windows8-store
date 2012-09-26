(function () {
    "use strict";
    /**
     * Category Service.
     * Responsible for connecting to the category endpoint in DR Rest API and caching the results.
     */
    var Class = DR.Class.extend(
        function (client) {
            this._client = client;
        },
        {
            _client: null,
            _categories: {},
            _rootCategories: [],

            /** 
             * Get the root categories
             */
            getRootCategories: function () {
                var self = this;
                return this._client.categories.list({ "expand": "category" })
                    .then(function (data) {
                        data.category.forEach(function(e, i) {
                            self._rootCategories.push(e);
                        });
                        return self._rootCategories;
                    });
            },

            getCategoriesById: function (id) {
                var self = this;
                return this._client.categories.get(id, { expand: 'categories.category.id' })
                .then(function (category) {
                    self._categories[id] = category;
                    return self._categories[id];
                });
            }
        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        CategoryService: Class
    });

})();
