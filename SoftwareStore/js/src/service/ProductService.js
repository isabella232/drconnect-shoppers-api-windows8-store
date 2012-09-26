(function () {
    "use strict";
    /**
     * Products Service.
     * Responsible for connecting to the product endpoint in DR Rest API and caching the results.
     */
    var Class = DR.Class.extend(
        function (client) {
            this._client = client;
        },
        {
            _client: null,
            _productsByCategory: {},
            _sampleProducts: {},
            _products: {},

            /**
             * Get product by id
             */
            getProduct: function (id) {
                var self = this;
                return this._client.products.get(id)
                .then(function (product) {
                    self._products[id] = product;
                    return product;
                });
            },

            /**
             * Get the sample products for a category
             */
            listSampleProductsForCategory: function (catId, pageSize) {
                var self = this;
                var params = { pageNumber: 1, pageSize: pageSize, expand: "product.id" };

                return this._retrieveProductsByCategory(catId, params).then(function (products) {
                    self._sampleProducts[catId] = products;
                    return self._sampleProducts[catId];
                });
            },

            /** 
             * Get the products for a category
             */
            listProductsByCategory: function (catId, pageNumber, pageSize, sort) {
                var self = this;
                // If there's no pageNumber passed, get the first page
                if (!pageNumber) pageNumber = 1;

                var params = { expand: 'product', pageNumber: pageNumber };

                // If there's a page size, send it
                if (pageSize) params.pageSize = pageSize;

                if (sort && sort.field && sort.field != "") {
                    params.sort = sort.field;
                    if (sort.direction && sort.direction != "") params.sort += "-" + sort.direction;
                }

                return this._retrieveProductsByCategory(catId, params).then(function (products) {
                    self._productsByCategory[catId + "p"+pageSize] = products;
                    return self._productsByCategory[catId + "p" + pageSize];
                });
            },
            _retrieveProductsByCategory: function (catId, params) {
                return this._client.products.listProductsByCategory(catId, params)
                    .then(function (data) {
                        if (data.product) {
                            return data.product;
                        } else {
                            return [];
                        }
                    });
            }
        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        ProductService: Class
    });

})();
