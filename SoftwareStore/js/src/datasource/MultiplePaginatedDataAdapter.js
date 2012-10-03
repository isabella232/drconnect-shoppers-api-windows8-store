(function () {
    
    /** 
     * Process an error when a service call fails
     */

    function processErrorResponse(error) {
       console.error("Status: " + error.status + ", Code: " + error.details.error.code + ", Description: " + error.details.error.description);
       return WinJS.Promise.wrapError("Status: " + error.status + ", Code: " + error.details.error.code + ", Description: " + error.details.error.description);
      
    }

    /**
     * Contains a list of different DataAdapters and exposes them as only one DataAdapter, managing the pagination
     */
    var MultiplePaginatedDataAdapter = DR.Class.extend(
        function (dataAdapters) {

            // Constructor
            this._totalCount = null;
            var self = this;
            // List of DataAdapters
            this._dataAdapters = [];
            dataAdapters.forEach(function (dataAdapter) {
                self._dataAdapters.push({
                    "dataAdapter": dataAdapter.da,
                    "name": dataAdapter.name
                });
            });
            
        },

        /** Data Adapter interface methods
         * These define the contract between the virtualized datasource and the data adapter.
         * These methods will be called by virtualized datasource to fetch items, count etc.    
         */
        {

            /** Called to get a count of the items
             * Calls a getCount for each DataAdapter in the DataAdapters list and summarizes it (sets _totalCount and returns the value) 
             * The value of the count can be updated later in the response to itemsFromIndex
             */
            getCount: function () {

                var self = this;
                if (!this._totalCount) {
                    if (this._dataAdapters.length > 0) {
                        var promises = [];
                        // Gets the count for each dataAdapter
                        this._dataAdapters.forEach(function (dataAdapter) {
                            promises.push(dataAdapter.dataAdapter.getCount());
                        });

                        return WinJS.Promise.join(promises).then(function (responses) {
                            var offset = 0;
                            for (var i = 0; i < responses.length; i++) {
                                var response = parseInt(responses[i]);
                                self._dataAdapters[i].count = response;
                                self._dataAdapters[i].firstIndex = offset;
                                self._dataAdapters[i].lastIndex = offset + response - 1;
                                offset += response;
                            }
                            self._totalCount = offset;
                            return self._totalCount;
                        }, processErrorResponse);
                    } else {
                        return WinJS.Promise.wrap(0);
                    }
                } else {
                    return WinJS.Promise.wrap(this._totalCount);
                }

            },

            /* Called by the virtualized datasource to fetch items
             *
             * Handles the different dataAdapters to manage the pagination dediding which dataApdapter/s should call to get the requested item according to
             * parameters
             * Must return back an object containing fields:
             * items: The array of items of the form items=[{ key: key1, data : { field1: value, field2: value, ... }}, { key: key2, data : {...}}, ...];
             * offset: The offset into the array for the requested item
             * totalCount: (optional) update the value of the count
             */
            itemsFromIndex: function (requestIndex, countBefore, countAfter) {
                console.log("RI: " + requestIndex + "[" + countBefore + "," + countAfter + "]");
                var self = this;
                if (self._totalCount && requestIndex >= self._totalCount) {
                    return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                }

                //************************ Paging Logic ************************************

                var firstIndex = (requestIndex - countBefore);
                var lastIndex = (requestIndex + countAfter);

                var promises = [];
                this._dataAdapters.forEach(function (dataAdapter) {
                    promises.push(self._getRequestedRange(dataAdapter, firstIndex, lastIndex));
                });
               
                return WinJS.Promise.join(promises).then(function (responses) { return self._processResults(responses, countBefore); }, processErrorResponse);

            },

            /**
             * Returns a promise for the requested dataadapter considering the firstIndex and lastIndex to determine if corresponds to call to the dataAdapter and
             * the range it should ask
             */
            _getRequestedRange: function (dataAdapter, firstIndex, lastIndex) {
                if (firstIndex <= dataAdapter.lastIndex && lastIndex >= dataAdapter.firstIndex) {
                    var begin = Math.max(firstIndex, dataAdapter.firstIndex) - dataAdapter.firstIndex;
                    var end = Math.min(lastIndex, dataAdapter.lastIndex) - dataAdapter.firstIndex;

                    return dataAdapter.dataAdapter.itemsFromIndex(begin, 0, end - begin);
                } else {
                    return WinJS.Promise.wrap({
                        items: [],
                        totalCount: 0
                    });
                }
            },

            /**
           * Process the responses of each dataAdapter called (the pages asked)
           * and returns all items on an ordered list
           */
            _processResults: function (responses, countBefore) {
                var self = this;
                var offset = -1;
                var results = [];
                responses.forEach(function (response, i) {
                    if (response.items.length > 0 && offset == -1) {
                        offset = response.offset;
                    }
                    var dataAdapter = self._dataAdapters[i];
                    response.items.forEach(function (dataItem) {
                        dataItem.key = (parseInt(dataItem.key) + dataAdapter.firstIndex).toString();
                        dataItem.groupKey = dataAdapter.name;
                        results.push(dataItem);
                    });
                });
                
                return {
                    items: results, // The array of items
                    offset: offset + countBefore, // The offset into the array for the requested item
                    totalCount: this._totalCount
                };
            }
        });

    WinJS.Namespace.define("DR.Store.DataSource", {
        MultiplePaginatedDataAdapter: MultiplePaginatedDataAdapter,
        MultiplePaginatedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (dataAdapters) {
            this._baseDataSourceConstructor(new MultiplePaginatedDataAdapter(dataAdapters));
        })
    });
})();
