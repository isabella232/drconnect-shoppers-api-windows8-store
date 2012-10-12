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
                        return data;
                        /*if (data.product) {
                            return data.product;
                        } else {
                            return [];
                        }*/
                    });
            },

            /**
             * Searches for a product by keyword
             */
            searchProduct: function (keyword, pageNumber, pageSize) {

                // Set params
                var params = { expand: 'product.id', keyword: keyword };

                var self = this;
                console.log("Calling DR productSearch service");

                return this._client.products.search(params)
                    .then(function (data) {
                        var total = data.totalResults;

                        if (typeof data.product != 'undefined' || total > 0) {
                            // If pageSize and pageNumber are set
                            if (pageSize) params.pageSize = pageSize;
                            if (pageNumber) params.pageNumber = pageNumber;
                            var ids = self._concatIdsFromProducts(data.product);
                            return self._client.products.getProductsByIds({ 'productIds': ids, expand: 'product', pageSize: pageSize, pageNumber: pageNumber })
                                .then(function (products) {
                                    return {
                                        product: products.product,
                                        totalResults: total
                                    };
                                });
                        } else {
                            return {
                                totalResults: data.totalResults,
                                product: []
                            };
                        }
                    });
            },

            /**
	        * Returns a string with all productIds existent in the products collection separated with commas
	        */
            _concatIdsFromProducts: function (products) {
                var result = '';
                products.forEach(function (p) {
                    result += p.id + ',';
                });
                return result;
            }
        }
    );

    WinJS.Namespace.define("DR.Store.Service", {
        ProductService: Class
    });

})();
