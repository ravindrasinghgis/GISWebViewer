/*******************************************
 * 
 * Title        :     ViewManager.js
 * Description  :     This class is to manage the Map Viewers and its corressponding widgets.
 * Auther       :     Ravindra Singh
 * E-Mail       :     r.singh@openware.com.kw / rasingh@kockw.com
 * Date         :     06/02/2018
 *******************************************/


define([
    "esri/layers/TileLayer",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/views/2d/draw/Draw",
    "esri/Map",
    "esri/views/MapView",
    //"esri/views/SceneView",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/geometry/geometryEngine",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Print",
    "esri/widgets/Locate",
    "esri/widgets/ScaleBar",
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Home",
    "esri/widgets/Search",
    "esri/widgets/Popup",
    "esri/core/watchUtils",

    "application/widgets/DrawWidget",
    "application/widgets/MeasurementWidget",
    "application/widgets/Bookmark/BookmarkWidget",

    "dojo/_base/lang",
    "dojo/query",
    "dojo/dom",
    "dojo/on",
    "dojo/_base/declare",
    "dojo/Deferred",

    // Bootstrap
    "bootstrap/Collapse",
    "bootstrap/Dropdown",
    "bootstrap/Tab",

    // Calcite Maps
    "calcite-maps/calcitemaps-v0.2", 

    //JQuery and Knockout
    "jquery",
    "knockout",

    "configs/appConfig",

    "dojo/domReady!"
  ], function(TileLayer, SketchViewModel, Graphic, GraphicsLayer, Draw, Map, MapView, Point, Polyline, Polygon, geometryEngine, LayerList, Legend, Print, Locate, ScaleBar, BasemapGallery, 
      BasemapToggle, Home, Search, Popup, watchUtils, DrawWidget, MeasurementWidget, BookmarkWidget, lang, query, dom, on, declare, Deferred, $, ko, appConfig) {

        return declare(null, {
  
        //--------------------------------------------------------------------------
        //  Lifecycle
        //--------------------------------------------------------------------------
    
        constructor: function (mapViewDiv) {
            console.info("Constructor of ViewManager = " + mapViewDiv);
            this._createMapView(mapViewDiv)
                .then(function(mapView) {
                    console.log("Map View Created...");
                    this.app.mapView = mapView;
                    this.app.activeView = mapView;
                    // Set out of the box Widgets
                    this._createMapWidgets();

                    // Set out App's custom Widgets.
                    this._createAppWidgets();

                    // Views - Listen to view size changes to show/hide panels
                    this.app.mapView.watch("size", lang.hitch(this, this._viewSizeChange));

                    // Popups - Listen to popup changes to show/hide panels
                    this.app.mapView.popup.watch(["visible", "currentDockPosition"], lang.hitch(this, this._setPanelVisibility) );

                    console.log("App config = "+ appConfig);
                    _loadAppConfig(appConfig);

                }.bind(this));

            console.log("Every thing is finished...");
        },

       

        _drawWidget: null,
        _measurementWidget: null,
        _bookmarkWidget: null,
       

        app: {
            center: [47.4818,29.3117], // Kuwait Location
            scale:1000000,
            draw2D: null,
            graphicsLayerCollection:[],
            operationalLayers: [],
            basemap: "streets",
            viewPadding: {
            top: 50,
            bottom: 0
            },
            uiComponents: ["zoom", "compass", "attribution"],
            dockOptions: {
            position: "auto",
            // Custom docking breakpoints
            breakpoint: {
                width: 768,
                height: 768
            }
            },
            currentMeasurement: {
            geometry: null,
            area:null
            },
            mapView: null,
            //sceneView: null,
            activeView: null,
            searchWidget: null,
            homeWidget: null,
            screenWidth: 0,
            printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        },

        _createMapView: function(mapViewDivId){
            var deferred = new Deferred();
            var mapView = null;
            this._createMap()
                .then(function(map2D) {
                    mapView = new MapView({
                        container: mapViewDivId, //"mapViewDiv",
                        map: map2D,
                        center: this.app.center,
                        scale: this.app.scale,
                        padding: this.app.viewPadding,
                        popup: new Popup({
                          dockOptions: this.app.dockOptions
                        }),
                        ui: {
                          components: this.app.uiComponents
                        }
                    });
                    //this.app.mapView = mapView;
                    deferred.resolve(mapView);
                }.bind(this));

            return deferred.promise;
        },

        _createMap: function(){
            var deferred = new Deferred();
            this._loadLayers();
            var map = new Map({
                basemap: this.app.basemap,
                layers: this.app.operationalLayers
              });
            deferred.resolve(map);
            return deferred.promise;
        },

        _loadLayers: function(){
            var transportationLyr = new TileLayer({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
                // This property can be used to uniquely identify the layer
                id: "World Transportation",
                visible: true
            });
    
    
            var housingLyr = new TileLayer({
                url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Housing_Density/MapServer",
                id: "Newyork Housing",
                visible: true,
                opacity: 1
            });

            var FootprintLyr = new TileLayer({
                url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Footprint/MapServer",
                id: "Newyork Footprint",
                visible: true,
                opacity: 1
            });

            var OpenspaceLyr = new TileLayer({
                url: "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Open_Space/MapServer",
                id: "Newyork Openspace",
                visible: true,
                opacity: 1
            });

            
            

            this. app.operationalLayers.push(transportationLyr, housingLyr, FootprintLyr, OpenspaceLyr);
        },


        // out of the box Widgets for the map view
        _createMapWidgets: function() {
            var mapView = this.app.mapView;
            if (mapView) {
                this._createWidget(null, "scalebar", mapView);      // scalebar Widget- no divId required
                this._createWidget(null, "home", mapView);          // home Widget- no divId required
                this._createWidget(null, "togglebasemap", mapView); // togglebasemap Widget- no divId required
                this._createWidget(null, "locate", mapView); // locate Widget- no divId required
                this._createWidget("basemapGalleryDiv", "basemapGallery", mapView); // basemapGallery Widget
                this._createWidget("printDiv", "print", mapView); // print Widget
                this._createWidget("layersDiv", "layerlist", mapView); // layerlist Widget
                this._createWidget("legendDiv", "legend", mapView); // legend Widget
                this._createWidget("searchWidgetDiv", "search", mapView); // search Widget
                 
                 
            }
        },
        
        _viewSizeChange: function(screenSize) {
            if (this.app.screenWidth !== screenSize[0]) {
              this.app.screenWidth = screenSize[0];
              //setPanelVisibility();
              lang.hitch(this, this._setPanelVisibility())
            }
        },

        // Panels - Show/hide the panel when popup is docked
        _setPanelVisibility: function() {
            var isMobileScreen = this.app.activeView.widthBreakpoint === "xsmall" ||
            this.app.activeView.widthBreakpoint ===
            "small",
            isDockedVisible = this.app.activeView.popup.visible && this.app.activeView.popup
            .currentDockPosition,
            isDockedBottom = this.app.activeView.popup.currentDockPosition && this.app.activeView
            .popup.currentDockPosition
            .indexOf("bottom") > -1,
            isDockedTop = this.app.activeView.popup.currentDockPosition && this.app.activeView
            .popup.currentDockPosition
            .indexOf("top") > -1;
            // Mobile (xsmall/small)
            if (isMobileScreen) {
            if (isDockedVisible && isDockedBottom) {
                query(".calcite-panels").addClass("invisible");
            } else {
                query(".calcite-panels").removeClass("invisible");
            }
            } else { // Desktop (medium+)
                if (isDockedVisible && isDockedTop) {
                    query(".calcite-panels").addClass("invisible");
                } else {
                    query(".calcite-panels").removeClass("invisible");
                }
            }
        },


        // Widgets for the app
        _createAppWidgets: function() {
            var mapView = this.app.mapView;
            if (mapView) {
                mapView.then(function(){
                    // add Draw Widget
                     this._drawWidget = new DrawWidget(null, mapView);
                    //Add Measurement Widget
                    this._measurementWidget = new MeasurementWidget(null, mapView);

                    //Add Bookmark Widget
                    this._bookmarkWidget = new BookmarkWidget({ mapView: mapView  }, "bookmarkSlidesNode");
                    this._bookmarkWidget.startup();
                }.bind(this));
            }
        },

        _createWidget: function(divId, name, view) {
            var widget = null;
            if (view) {
                switch (name) {
                    case "scalebar":
                        widget =  new ScaleBar({
                                        view: view,
                                        unit: "dual" // The scale bar displays both metric and non-metric units.
                                    });
                        view.ui.add(widget, "bottom-left");
                        break;
                    case "home":
                        widget =  new Home({
                                        view: view
                                    });
                        view.ui.add(widget, "top-left");
                        break;
                    case "togglebasemap":
                        widget =  new BasemapToggle({
                                        view: view, 
                                        nextBasemap: "hybrid"
                                    });
                        view.ui.add(widget, "bottom-right");
                        break;
                    case "locate":
                        widget = new Locate({
                                        view: view
                                    });
                        view.ui.add(widget, "top-left");
                    break;
                    case "basemapGallery":
                        var optionsBasemapGallery= {view: view, container: divId};
                        widget = new BasemapGallery( optionsBasemapGallery );
                        break;
                    case "print":
                        var printTemplateOptions = {
                            title: "KOC OTS SEK",
                            author: "",
                            copyright: "Kuwait Oil Company, Kuwait",
                            legendEnabled: true
                        };
                        var optionsPrint = {view: view, container: divId, printServiceUrl: this.app.printServiceUrl, templateOptions: printTemplateOptions};
                        widget = new Print(optionsPrint);
                        break;
                    case "layerlist":
                        var optionsLayerList = {view: view, container: divId};
                        widget = new LayerList(optionsLayerList);
                        break;
                    case "legend":
                        var optionsLengend= {view: view, container: divId};
                        widget = new Legend(optionsLengend);
                        break;
                    case "search":
                        widget = new Search({ view: view }, divId);
                        break;
                    default:
                        widget = null;
                }
            }
            return widget;
        },

        _loadAppConfig: function(appConfig)
        {
            $(document).ready(function()
              { 
                console.log("inside  jq ko");
                    function AppViewModel() {
                        this.kocAppMainName = ko.observable("IMP (SEK) Map Portal");
                        this.kocAppSubName = ko.observable("Kuwait Oil Company");
                    }

                    // Activates knockout.js ViewModel
                    ko.applyBindings(new AppViewModel());
              });
        },

         // Create a view manager
    //   this._appViewManager = new ViewManager(boilerplate);
    //   this._appViewManager.createViewFromItem(webItem, options)
    //     .then(function(results) {
    //       var view = results.view;
    //       var webMap = results.webMap;
    //       var webScene = results.webScene;
    //       // Set Widgets from config params
    //       this._appViewManager.createMapWidgets();
    //       this._appViewManager.createAppWidgets();
    //       this._appViewManager.setPopupPosition();
    //       this._appViewManager.setWidgetExtensions();
    //       this._appViewManager.setShare();
    //       // Set view from config params
    //       this._appViewManager.setViewpointAll();
    //       // Create html that requires the view...
    //       this._appHtml.createViewPanelsHtml(view, webMap || webScene);
    //       this._appHtml.showValidMenusOnly(view);

    //     }.bind(this))
    //     .otherwise(function(error) { // Create view failed
    //       Message.show(Message.type.error, error, true, this._showErrors);
    //     }.bind(this))
    //     .always(function() {
    //       Message.removeLoading();
    //     });

    });
});