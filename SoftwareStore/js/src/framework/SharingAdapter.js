/**
 * Sharing Adapter
 * Used to simplify the sharing API
 * 
 */
(function () {
    "use strict";

    
    var Class = DR.Class.extend(
        function (sharingEvent) {
            console.log("Created new sharing adapter");
            this.request = sharingEvent.request;
            this.data = this.request.data;
        },
        {
            request: null,
            data: null,
            deferral: null,

            /**
              * Sets the sharing basic info
              */
            setBasicInfo: function (title, description) {
                console.log("Sharing initialized with title: " + title);
                this.data.properties.title = (title?title:"");
                this.data.properties.description = (description?description:"");
            },

            /**
             * Shares an image
             */
            setImage: function (uri) {
                if (!uri || uri == "") return;
                console.log("Sharing image using URI: " + uri);
                var reference = DR.Store.Util.File.getReferenceFromURI(uri);
                this.data.properties.thumbnail = reference;
                this.data.setBitmap(reference);
            },

            /**
             * Shares HTML
             */
            setHTML: function (html) {
                if (!html) html = "";
                console.log("Sharing HTML");
                this.data.setHtmlFormat(Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html));
            },

            /**
             * Shares text
             */
            setText: function (text) {
                if (!text) text = "";
                console.log("Sharing Text");
                this.data.setText(text);
            },

            /**
             * Shares a URI
             */
            setUri: function (uri) {
                if (!uri || uri == "") return;
                console.log("Sharing URI: " + uri);
                this.data.setUri(new Windows.Foundation.Uri(uri));
            },

            /**
             * Shows an error in the sharing panel
             */
            fail: function (error) {
                console.log("Sharing failed. Showing error: " + error);
                this.request.failWithDisplayText(error);
                this.finish();
            },

            /**
             * Returns whether the sharing process is async or not
             */
            isAsync: function() {
                return (this.deferral != null);
            },

            /** 
             * Makes the sharing process async
             */
            makeAsync: function () {
                console.log("Making sharing process async");
                this.deferral = this.request.getDeferral();
            },

            /**
             * Finishes the sharing process if it is async. Does nothing otherwise
             */
            finish: function () {
                if (this.isAsync()) {
                    this.deferral.complete();
                    this.deferral = null;
                    console.log("Async sharing process finished");
                }
            }
        }
        );

    WinJS.Namespace.define("DR.MVC.Sharing", {
        SharingAdapter: Class
    });

})();