(function () {
    
    //Called on an error from the XHR Object
    function processErrorResponse(error) {
        if (error.status == 401) {
            WinJS.log && WinJS.log(error.code, "sample", "error");
        } else {
            WinJS.log && WinJS.log("Error fetching data from the service. " + error.description, "sample", "error");
        }
        return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.noResponse));
    }

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

            
                var that = this;
                if (!this._count) {
                    return this.retrievePage(1, this._pageSize).then(function (response) {
                        that._count = response.count;
                        return that._count;
                    });
                } else {
                    return WinJS.Promise.wrap(this._count);
                }

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

                //************************ Paging And Caching Logic ************************************

                var paginationInfo = this._calculatePaginationInfo(requestIndex, countBefore, countAfter);

                var promises = [];
                for (var i = paginationInfo.firstPageNumber; i <= paginationInfo.lastPageNumber; i++) {
                    console.log(i + "[" + paginationInfo.pageSize + "]");
                    promises.push(this.retrievePage(i, paginationInfo.pageSize));
                }

                return WinJS.Promise.join(promises).then(function (responses) { return that._processResults(responses, paginationInfo); }, processErrorResponse);
            },

            /**
             * Cal...
             */
            _calculatePaginationInfo: function (requestIndex, countBefore, countAfter) {
                var firstIndex = (requestIndex - countBefore);
                var lastIndex = (requestIndex + countAfter);
                if (this._count) {
                    lastIndex = Math.min(this._count - 1, lastIndex);
                }

                var pi = {pageSize: this._pageSize}
                pi.firstPageNumber = Math.floor(firstIndex / pi.pageSize) + 1;
                pi.lastPageNumber = Math.floor(lastIndex / pi.pageSize) + 1;
                pi.offset = (requestIndex % pi.pageSize);
                pi.fetchIndex = (pi.firstPageNumber - 1) * pi.pageSize;

                return pi;
            },

            _processResults: function(responses, paginationInfo) {
                var that = this;
                var results = [];
                var i = 0;
                responses.forEach(function (response) {
                    if (!that._count) {
                        that._count = response.count;
                    }

                    response.items.forEach(function (dataItem) {
                        results.push({
                            key: (paginationInfo.fetchIndex + i).toString(),
                            data: dataItem
                        });
                        i++;
                    });
                });
                console.log(paginationInfo.offset);
                return {
                    items: results, // The array of items
                    offset: paginationInfo.offset, // The offset into the array for the requested item
                    totalCount: this._count
                };
            }
        });

    WinJS.Namespace.define("DR.Store.Core.DataSource", {
        PaginatedDataSource: PaginatedDataSource
    });
})();
