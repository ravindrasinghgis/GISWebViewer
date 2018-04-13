/*******************************************
 * Title:   Bookmark Widget
 * Description: Store the predefined bookmarks:
 *              1>  North Kuwait Area
 *              2>  West Kuwait Area
 *              3>  South & East Kuwait Area
 *******************************************/

define([
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/on",
    "dojo/dom",
    "dojo/topic",
    "dojo/promise/all",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    "esri/kernel",
    "esri/request",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Extent",
    "dijit/registry",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/i18n!application/widgets/Bookmark/nls/strings",
    "dojo/text!application/widgets/Bookmark/templates/bookmarkTemplate.html",
    "knockout"],
    function (lang, declare, on, dom, topic, all, domConstruct, domClass, domStyle, esriNS, esriRequest, 
        Map, MapView, Extent, registry, _WidgetBase, _TemplatedMixin, i18n, template, ko) {

        var bookmarkWidget = declare("GISWebViewer.BookmarkWidget", [_WidgetBase, _TemplatedMixin],
        {
            templateString: template,
            _view: null,

            constructor: function (options, srcRefNode) {
                options = options || {};
                declare.safeMixin(this, options);
                this._i18n = i18n;
                this.domNode = srcRefNode; // This is the source node, where template html is embedded.
                if(options.mapView){
                    this._view = options.mapView;
                }
            },

            // [START] ---------------- System Defined Functions ----------------
            postCreate: function(){
                this.inherited(arguments);
                var currentWidget = this;
            },

            startup: function(){
                this.inherited(arguments);
                var currentWidget = this;

                on(this.bookmarkNorthNode,"click", function (e) { // Zoom to North Area
                    var map = this._view.map;
                    this._view.goTo(new Extent({
                        xmin: 5312762.0342065766,
                        ymin: 3478575.2339570918,
                        xmax: 5312982.4881515224,
                        ymax: 3478929.7239005649,
                        spatialReference: 102100
                      }));
                }.bind(this));

                on(this.bookmarkSEKNode,"click", function (e) { // Zoom to SEK Area
                    var map = this._view.map;
                    this._view.goTo(new Extent({
                        xmin: 5339734.473385565,
                        ymin: 3375733.4371235599,
                        xmax: 5339969.4614355518,
                        ymax: 3376111.2979079382,
                        spatialReference: 102100
                    }));
                }.bind(this));

                on(this.bookmarkWestNode,"click", function (e) { // Zoom to West Area
                    var map = this._view.map;
                    this._view.goTo(new Extent({
                        xmin: 5304981.4147237334,
                        ymin: 3365839.4788327753,
                        xmax: 5305229.9379569422,
                        ymax: 3366239.1041917754,
                        spatialReference: 102100
                    }));
                }.bind(this));


            },

            show: function(){
                this.inherited(arguments);
                var currentwidget = this;
            },

            hide: function(){
                this.inherited(arguments);
            },

            _exportData: function (evt) {

            }
            // [END] ---------------- System Defined Functions ----------------

            
            
            // [START] ---------------- User Defined Functions ----------------

            

            // [END] ---------------- User Defined Functions ----------------
        });

        return bookmarkWidget;
    }); // End of Module Define
 
