(function () {
    
    /** 
     * Process an error when a service call fails
     */

    function processErrorResponse(error) {
       console.error("Status: " + error.status + ", Code: " + error.details.error.code + ", Description: " + error.details.error.description);
       throw WinJS.Promise.wrapError("Status: " + error.status + ", Code: " + error.details.error.code + ", Description: " + error.details.error.description);
     
    }

    /**
     * Definition of the data adapter
     */
    var PaginatedDataAdapter = DR.Class.extend(
        function () {

            // Constructor
            this._pageSize = 20;
            this._count = null;
            // This value is to assign for each of the items returned. SubClasess should override this property
            this._itemType = null;
        },

        /** 
         * Data Adapter interface methods
         * These define the contract between the virtualized datasource and the data adapter.
         * These methods will be called by virtualized datasource to fetch items, count etc.    
         */
        {

            // Abstract Functions that should be define on child classes

            /**
            * Retrieves a promise the page specified on parameters
            * return: It should return a json{count: <total number of items>, items: <list of items from page>}
            */
            retrievePage: function(pageNumber, pageSize){

            },


            /**
             * Called to get a count of the items
             * The value of the count can be updated later in the response to itemsFromIndex
             */
            getCount: function () {

            
                var self = this;
                if (!this._count) {
                    return this.retrievePage(1, this._pageSize).then(function (response) {
                        if (response.count) {
                            self._count = parseInt(response.count);
                        } else {
                            self._count = 0;
                        }
                        return self._count;
                    }, processErrorResponse);
                } else {
                    return WinJS.Promise.wrap(this._count);
                }

            },

            /** Called by the virtualized datasource to fetch items
             *  Handles the parameters to determines the page or pages it should ask to the service. The minimum fetch size is pageSize, so if the function is
             *  called to retrive 1 item, it will return the whole page for the item asked
             *
             *  Must return back an object containing fields:
             *    items: The array of items of the form items=[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
             *    offset: The offset into the array for the requested item
             *    totalCount: (optional) update the value of the count
             */
            itemsFromIndex: function (requestIndex, countBefore, countAfter) {
                var self = this;
                if (self._count && requestIndex >= self._count) {
                    return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                }

                //************************ Paging And Caching Logic ************************************

                var paginationInfo = this._calculatePaginationInfo(requestIndex, countBefore, countAfter);

                var promises = [];
                for (var i = paginationInfo.firstPageNumber; i <= paginationInfo.lastPageNumber; i++) {
                    console.log(i + "[" + paginationInfo.pageSize + "]");
                    promises.push(this.retrievePage(i, paginationInfo.pageSize));
                }

                return WinJS.Promise.join(promises).then(function (responses) { return self._processResults(responses, paginationInfo); }, processErrorResponse);
            },

            /**
             * Calculates the pagination Info considering the parameters and determining how many pages should be asked to the service
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

            /**
            * Process the responses of each service called (the pages asked)
            * and returns all items on an ordered list
            */
            _processResults: function(responses, paginationInfo) {
                var self = this;
                var results = [];
                var i = 0;
                responses.forEach(function (response) {
                    if (!self._count) {
                        self._count = response.count;
                    }

                    response.items.forEach(function (dataItem) {
                        results.push({
                            key: (paginationInfo.fetchIndex + i).toString(),
                            data: dataItem,
                            itemType: self._itemType
                        });
                        i++;
                    });
                });
                return {
                    items: results, // The array of items
                    offset: paginationInfo.offset, // The offset into the array for the requested item
                    totalCount: this._count
                };
            }
        });

    WinJS.Namespace.define("DR.Store.DataSource", {
        PaginatedDataAdapter: PaginatedDataAdapter
    });
})();
