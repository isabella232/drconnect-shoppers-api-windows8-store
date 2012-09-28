(function () {
    
    // Definition of the data adapter
    var PaginatedDataSource = DR.Class.extend(
        function () {

            // Constructor
            this._pageSize = 20;
            this._cachedProducts = {};
            this._count = null;
        },

        // Data Adapter interface methods
        // These define the contract between the virtualized datasource and the data adapter.
        // These methods will be called by virtualized datasource to fetch items, count etc.    
        {

            // Abstract Functions that should be define on child classes

            /**
            * Retrieves a promise the page specified on parameters
            * return: It should return a json{count: <total number of items>, items: <list of items from page>}
            */
            retrievePage: function(pageNumber, pageSize){

            },


            // Called to get a count of the items
            // The value of the count can be updated later in the response to itemsFromIndex
            getCount: function () {


                /*var client = SdkSample.client;

                return client.products.listProductsByCategory(25587100, { expand: "all", pageNumber: 1, pageSize: 1 }).then(function (products) {
                    that._count = products.totalResults;
                    return products.totalResults;
                });*/

             
                that = this;
                return this.retrievePage(1, this._pageSize).then(function (response) {
                    that._count = response.count;
                });
                /*if (!this._count) {
                    return this.retrievePage(1, this._pageSize).then(function (response) {
                        that._count = response.count;
                    });
                } else {
                    //var p = new WinJS.Promise();
                    return WinJS.Promise.wrap(this._count);
                }*/
                // TODO: Response when this._count setted?

                
            },

            // Called by the virtualized datasource to fetch items
            // It will request a specific item and optionally ask for a number of items on either side of the requested item. 
            // The implementation should return the specific item and, in addition, can choose to return a range of items on either 
            // side of the requested index. The number of extra items returned by the implementation can be more or less than the number requested.
            //
            // Must return back an object containing fields:
            //   items: The array of items of the form items=[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
            //   offset: The offset into the array for the requested item
            //   totalCount: (optional) update the value of the count
            itemsFromIndex: function (requestIndex, countBefore, countAfter) {
                console.log("RI: " + requestIndex + "[" + countBefore + "," + countAfter + "]");
                var that = this;
                if (that._count && requestIndex >= that._count) {
                    return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                }

                var fetchIndex;

                //************************ Paging And Caching Logic ************************************
                var pageNumber, pageSize;

                var firstIndex = (requestIndex - countBefore);
                var lastIndex = (requestIndex + countAfter);
                if (this._count) {
                    lastIndex = Math.min(this._count - 1, lastIndex);
                }

                var pageSize = this._pageSize;

                var firstPageNumber = Math.floor(firstIndex / pageSize) + 1;
                var lastPageNumber = Math.floor(lastIndex / pageSize) + 1;

                var offset = (requestIndex % pageSize);
                var fetchIndex = (firstPageNumber - 1) * pageSize;

                var promises = [];

                for (var i = firstPageNumber; i <= lastPageNumber; i++) {
                    console.log(i + "[" + pageSize + "]");
                    //promises.push(client.products.listProductsByCategory(25587100, { expand: "all", pageNumber: i, pageSize: pageSize }));
                    promises.push(this.retrievePage(i, pageSize));
                }

                //return WinJS.Promise.join(promises).then(this.processPageResponse(responses));

                return WinJS.Promise.join(promises).then(function (responses) {
                    var results = [];
                    var i = 0;
                    responses.forEach(function (response) {
                        if (!that._count) {
                            that._count = response.count;
                        }

                        response.items.forEach(function (dataItem) {
                            results.push({
                                key: (fetchIndex + i).toString(),
                                data: dataItem
                            });
                            i++;
                        });
                    });
                    console.log(offset);
                    return {
                        items: results, // The array of items
                        offset: offset, // The offset into the array for the requested item
                    };
                },
                //Called on an error from the XHR Object
                    function (error) {
                        if (error.status == 401) {
                            WinJS.log && WinJS.log(error.code, "sample", "error");
                        } else {
                            WinJS.log && WinJS.log("Error fetching data from the service. " + error.description, "sample", "error");
                        }
                        return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.noResponse));
                    });
            }
        });

    WinJS.Namespace.define("DR.Store.Core.DataSource", {
        PaginatedDataSource: PaginatedDataSource
    });
})();
