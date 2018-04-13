/*******************************************
 * Title:   Draw Widget
 * Description: Allows to draw following geometries on map:
 *              1>  Point
 *              2> Multi point
 *              3>  Polyline
 *              4>  Polygon
 *******************************************/


define([ 
    "esri/widgets/Sketch/SketchViewModel",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",

    "dojo/_base/lang",
    "dojo/_base/declare"
    ], function(
        SketchViewModel, GraphicsLayer, Graphic,
        lang, declare
    ) {
        return declare(null, {
  
            //--------------------------------------------------------------------------
            //  Lifecycle
            //--------------------------------------------------------------------------
        
            constructor: function (drawDivId, view) {
                console.info("js/application/widgets/DrawWidget.js - Constructor called... = ");
                if (view) {
                    this._view = view;
                    // Create UI
                    view.then(function(){
                        this._drawPointButton = document.getElementById("pointButton");
                        this._drawMultipointButton = document.getElementById("multipointButton");
                        this._drawLineButton = document.getElementById("polylineButton");
                        this._drawPolygonButton = document.getElementById("polygonButton");
                        this._drawresetBtn = document.getElementById("resetBtn");

                        this._createGraphicsLayer();
                        this._createNewSketchViewModel();
                        this._setSketchViewModelEvents();
                    }.bind(this));
                }
              
            },

            _view: null,
            // _graphic: null,
            // _currentOperation: null,
            _graphicsLayer: null,
            _sketchViewModel: null,

            _drawPointButton: null, 
            _drawMultipointButton: null, 
            _drawLineButton: null, 
            _drawPolygonButton: null, 
            _drawresetBtn: null, 


            _createGraphicsLayer: function() {
                // Layer
                var map = this._view.map;
                var layer = new GraphicsLayer({
                                title: "DrawGraphicsLayer",
                                listMode: "hide",
                                legendEnabled: false,
                            });
                map.add(layer);
                this._graphicsLayer = layer;
            },
          
            // _addGraphic: function(graphic) {
            //     this._graphicsLayer.removeAll();
            //     this._graphicsLayer.add(graphic);
            // },

              // create a new sketch view model
            _createNewSketchViewModel: function(){
                this._sketchViewModel = new SketchViewModel({
                    view: this._view,
                    layer: this._graphicsLayer,
                    pointSymbol: { // symbol used for points
                        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                        style: "square",
                        color: "#8A2BE2",
                        size: "16px",
                        outline: { // autocasts as new SimpleLineSymbol()
                            color: [255, 255, 255],
                            width: 3 // points
                        }
                    },
                    polylineSymbol: { // symbol used for polylines
                        type: "simple-line", // autocasts as new SimpleMarkerSymbol()
                        color: "#8A2BE2",
                        width: "4",
                        style: "dash"
                    },
                    polygonSymbol: { // symbol used for polygons
                        type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
                        color: "rgba(138,43,226, 0.8)",
                        style: "solid",
                        outline: {
                            color: "white",
                            width: 1
                        }
                    }
                });
            },

            _setSketchViewModelEvents: function(){

                // ************************************************************
                // Get the completed graphic from the event and add it to view.
                // This event fires when user presses
                //  * "C" key to finish sketching point, polygon or polyline.
                //  * Double-clicks to finish sketching polyline or polygon.
                //  * Clicks to finish sketching a point geometry.
                // ***********************************************************
                //this._createNewSketchViewModel();
                //lang.hitch(this, this._viewSizeChange)
                //sketchViewModel.on("draw-complete", function(evt) {
                this._sketchViewModel.on("draw-complete", lang.hitch(this,function(evt) {
                    // if multipoint geometry is created, then change the symbol
                    // for the graphic
                    if (evt.geometry.type === "multipoint") {
                        evt.graphic.symbol = {
                            type: "simple-marker",
                            style: "square",
                            color: "green",
                            size: "16px",
                            outline: {
                            color: [255, 255, 255],
                            width: 3
                            }
                        };
                    }
                    
                    // add the graphic to the graphics layer
                    //app.graphicsLayerCollection[0].add(evt.graphic);
                    this._graphicsLayer.add(evt.graphic);
                    this._setActiveButton();
                }));

                // *************************************
                // activate the sketch to create a point
                // *************************************
                // var drawPointButton = document.getElementById("pointButton");
                this._drawPointButton.onclick = lang.hitch(this, function() {
                    // set the sketch to create a point geometry
                    this._sketchViewModel.create("point");
                    this._setActiveButton(this._drawPointButton);
                });
                // drawPointButton.onclick = function() {
                //     // set the sketch to create a point geometry
                //     sketchViewModel.create("point");
                //     _setActiveButton(this);
                // };

                // ******************************************
                // activate the sketch to create a multipoint
                // ******************************************
                // var drawMultipointButton = document.getElementById("multipointButton");
                this._drawMultipointButton.onclick = lang.hitch(this, function() {
                    // set the sketch to create a multipoint geometry
                    this._sketchViewModel.create("multipoint");
                    this._setActiveButton(this._drawMultipointButton);
                });

                // ****************************************
                // activate the sketch to create a polyline
                // ****************************************
                // var drawLineButton = document.getElementById("polylineButton");
                this._drawLineButton.onclick = lang.hitch(this, function() {
                    // set the sketch to create a polyline geometry
                    this._sketchViewModel.create("polyline");
                    this._setActiveButton(this._drawLineButton);
                });

                // ***************************************
                // activate the sketch to create a polygon
                // ***************************************
                // var drawPolygonButton = document.getElementById("polygonButton");
                this._drawPolygonButton.onclick = lang.hitch(this, function() {
                    // set the sketch to create a polygon geometry
                    this._sketchViewModel.create("polygon");
                    this._setActiveButton(this._drawPolygonButton);
                });

                // **************
                // reset button
                // **************
                // var drawresetBtn = document.getElementById("resetBtn");
                this._drawresetBtn.onclick = lang.hitch(this, function() {
                    this._graphicsLayer.removeAll();
                    this._sketchViewModel.reset();
                    this._setActiveButton();
                });
            },

            _setActiveButton: function (selectedButton) {
                // focus the view to activate keyboard shortcuts for sketching
                this._view.focus();
                var elements = document.getElementsByClassName("action-button-active");
                for (var i = 0; i < elements.length; i++) {
                  elements[i].classList.remove("action-button-active");
                }
                if (selectedButton) {
                  selectedButton.classList.add("action-button-active");
                }
            }
            
            
            
    });
});