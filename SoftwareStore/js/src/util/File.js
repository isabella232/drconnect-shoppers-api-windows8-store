// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.Namespace.define("DR.Store.Util", {
        File: {
                getReferenceFromURI: function (uri) {
                    if (uri.indexOf("http://") === 0)
                        uri = new Windows.Foundation.Uri(uri);
                    else
                        uri = new Windows.Foundation.Uri("ms-appx:///" + uri);

                    return Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(uri);
                }
        }
    });

})();
