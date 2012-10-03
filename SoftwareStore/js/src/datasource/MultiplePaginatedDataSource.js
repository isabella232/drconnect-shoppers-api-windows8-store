(function () {
    
    //Process an error when a service call fails
    function processErrorResponse(error) {
       console.error("Status: " + error.status + ", Code: " + error.details.error.code + ", Description: " + error.details.error.description);
       return WinJS.Promise.wrapError("Status: " + error.status + ", Code: " + error.details.error.code + ", Description: " + error.details.error.description);
      
    }

    // Contains a list of different Datasources and exposes them as only one datasource, managing the pagination
    var MultiplePaginatedDataAdapter = DR.Class.extend(
        function (dataAdapters) {

            // Constructor
            this._pageSize = 20;
            this._totalCount = null;
            // List of Datasources
            var self = this;
            this._groupDataSource;
            this._dataSources = [];
            dataAdapters.forEach(function (ds) {
                self._dataSources.push({
                    ds: ds.da,
                    name: ds.name
                });
            });
            
            // Saves the counts for each datasource
            this._counts = [];
        },

        // Data Adapter interface methods
        // These define the contract between the virtualized datasource and the data adapter.
        // These methods will be called by virtualized datasource to fetch items, count etc.    
        {
            /* Called to get a count of the items
             * Calls a getCount for each datasource in the datasources list and summarizes it 
             * The value of the count can be updated later in the response to itemsFromIndex
             */
            getCount: function () {

                var that = this;
                if (!this._totalCount) {
                    if (this._dataSources.length > 0) {
                        var promises = [];
                        // Gets the count for each datasource
                        this._dataSources.forEach(function (datasource) {
                            promises.push(datasource.ds.getCount());
                        });

                        return WinJS.Promise.join(promises).then(function (responses) {
                            var offset = 0;
                            for (var i = 0; i < responses.length; i++) {
                                var response = parseInt(responses[i]);
                                that._dataSources[i].count = response;
                                that._dataSources[i].firstIndex = offset;
                                that._dataSources[i].lastIndex = offset + response - 1;
                                offset += response;
                            }
                            that._totalCount = offset;
                            
                            that._updateGroupDataSource();
                            
                            return that._totalCount;
                        }, processErrorResponse);
                    } else {
                        return WinJS.Promise.wrap(0);
                    }
                } else {
                    return WinJS.Promise.wrap(this._totalCount);
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
                if (that._totalCount && requestIndex >= that._totalCount) {
                    return WinJS.Promise.wrapError(new WinJS.ErrorFromName(WinJS.UI.FetchError.doesNotExist));
                }

                //************************ Paging Logic ************************************

                var firstIndex = (requestIndex - countBefore);
                var lastIndex = (requestIndex + countAfter);

                var promises = [];
                this._dataSources.forEach(function (datasource) {
                    promises.push(that._getRequestedRange(datasource, firstIndex, lastIndex));
                });
               
                /*
                var offset = 0;
                var i = 0;
                while (firstIndex > offset + (this._counts[i] - 1)) {
                    offset += this._counts[i];
                    i++;
                }
                

                
                var firstCallIndex = firstIndex - offset;
                promises.push(this._dataSources[i].itemsFromIndex(firstCallIndex, 0, lastIndex - firstIndex));

                while (lastIndex > offset + (this._counts[i] - 1)) {
                    offset += this._counts[i];
                    i++;
                }
                */
                /*
                previousTotals = totals;
                i++;
                for (i; lastIndex < totals; i++) {
                    var auxCountAfter = lastIndex - previousTotals;
                    promises.push(this._dataSources[i].itemsFromIndex(0,0,auxCountAfter));
                    previousTotals = totals;
                    totals += this._counts[i];
                }
                */
                return WinJS.Promise.join(promises).then(function (responses) { return that._processResults(responses, countBefore); }, processErrorResponse);

             /*   var paginationInfo = this._calculatePaginationInfo(requestIndex, countBefore, countAfter);

                var promises = [];
                for (var i = paginationInfo.firstPageNumber; i <= paginationInfo.lastPageNumber; i++) {
                    console.log(i + "[" + paginationInfo.pageSize + "]");
                    promises.push(this.retrievePage(i, paginationInfo.pageSize));
                }*/

            },

            _getRequestedRange: function (datasource, firstIndex, lastIndex) {
                if (firstIndex <= datasource.lastIndex && lastIndex >= datasource.firstIndex) {
                    var begin = Math.max(firstIndex, datasource.firstIndex) - datasource.firstIndex;
                    var end = Math.min(lastIndex, datasource.lastIndex) - datasource.firstIndex;

                    return datasource.ds.itemsFromIndex(begin, 0, end - begin);
                } else {
                    return WinJS.Promise.wrap({
                        items: [],
                        totalCount: 0
                    });
                }
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

            _processResults: function (responses, countBefore) {
                var that = this;
                var offset = -1;
                var results = [];
                var i = 0;
                responses.forEach(function (response) {
                    if (response.items.length > 0 && offset == -1) {
                        offset = response.offset;
                    }
                    var datasource = that._dataSources[i];
                    response.items.forEach(function (dataItem) {
                        dataItem.key = (parseInt(dataItem.key) + datasource.firstIndex).toString();
                        dataItem.groupKey = "key" + i;
                        results.push(dataItem);
                    });
                    i++;
                });
                
                return {
                    items: results, // The array of items
                    offset: offset + countBefore, // The offset into the array for the requested item
                    totalCount: this._totalCount
                };
            },

            /** 
             * Returns the data adapters
             */
            getDataAdapters: function () {
                return this._dataSources;
            },

            /**
             * Creates a new datasource containing the child's datasources names, with the following format:
             * {key: <group key>, label: <group label>}
             * It should be used to group the elements by datasource
             */
            getGroupDataSource: function () {
                if (!this._groupDataSource) {
                    var self = this;
                    var groups = [];
                    var adapters = this.getDataAdapters();
                    adapters.forEach(function (da, i) {
                        groups.push({ key: "key" + i, label: da.name, firstItemIndex: da.firstIndex });
                    });
                    this._groupDataSource = new DR.Store.Core.DataSource.InMemoryGroupDataSource(groups);
                }

                return this._groupDataSource;
            },

            /**
             * Updates the start indexes of the groups
             */
            _updateGroupDataSource: function () {
                var self = this;
                var groups = this.getGroupDataSource().groups;
                var indexes = [];
                groups.forEach(function (g, i) {
                    if (self._dataSources[i].count == 0) {
                        indexes.push(i);
                    }
                    g.firstItemIndex = self._dataSources[i].firstIndex;
                });

                for (var i = indexes.length - 1; i >= 0; i--) {
                    var j = indexes[i];
                    groups.splice(j, 1);
                }
            }
            
        });

    WinJS.Namespace.define("DR.Store.Core.DataSource", {
        MultiplePaginatedDataAdapter: MultiplePaginatedDataAdapter,
        MultiplePaginatedDataSource: WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function (dataAdapters) {
            this._dataAdapter = new MultiplePaginatedDataAdapter(dataAdapters);
            this._baseDataSourceConstructor(this._dataAdapter);
        }, {
            getGroupDataSource: function () {
                return this._dataAdapter.getGroupDataSource();
            }
        })
    });
})();
