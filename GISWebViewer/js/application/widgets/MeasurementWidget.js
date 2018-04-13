/*******************************************
 * Title:   Measurement Widget
 * Description: Allows to measure following geometries on map:
 *              1>  Point
 *              2>  Polyline
 *              3>  Polygon
 *******************************************/

define([
    "esri/views/2d/draw/Draw",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/geometryEngine",
    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/SpatialReference",

    "dojo/dom",
    "dojo/on",
    "dojo/query",
    "dojo/_base/lang",
    "dojo/_base/declare"
    ], function( 
        Draw,
        GraphicsLayer, 
        Graphic,
        Point, 
        Polyline, 
        Polygon,
        PictureMarkerSymbol,
        geometryEngine,
        webMercatorUtils,
        SpatialReference,

        dom,
        on,
        query,
        lang, 
        declare
    ){
    return declare(null, {
        //--------------------------------------------------------------------------
        //  Lifecycle
        //--------------------------------------------------------------------------

        constructor: function (measureDivId, view) {
            if (view) {
                this._view = view;
                this._measureDivId = measureDivId;
                // Create UI
                view.then(function(){
                    this._pointButtonMeasure      = dom.byId("pointButtonMeasurement"); //document.getElementById("pointButtonMeasurement");
                    this._polyLineButtonMeasure   = dom.byId("polylineButtonMeasurement");
                    this._polygonButtonMeasure    = dom.byId("polygonButtonMeasurement");
                    this._resetBtnMeasure         = dom.byId("resetBtnMeasurement");

                    this._unitLineSelect          = dom.byId("measurementLineUnitSelect");
                    this._unitAreaSelect          = dom.byId("measurementAreaUnitSelect");
                    this._unitPointSelect         = dom.byId("measurementPointSelector");

                    this._createGraphicsLayer();
                    /***************************************************
                    * A measurement widget is not part of the ArcGIS 4.6 API for JavaScript. 
                    * It will be added in a future release. In the current version of the API, 
                    * you can implement your own measuring tools using Draw class and geometryEngine.
                    */
                    this._draw = new Draw({ view: view });

                    this._addActionEvents();

                }.bind(this));
            }
        },

        _view: null,
        _graphicsLayer: null,
        _draw: null,
        _measureDivId: null,
        _currentGraphic: null,
        _currentUnit: null,
        _currentUnitAlias: null,

        _pointButtonMeasure: null,
        _polyLineButtonMeasure: null,
        _polygonButtonMeasure: null,
        _resetBtnMeasure: null,

        _unitLineSelect: null,
        _unitAreaSelect: null,
        _unitPointSelect: null,

        _CHAR_DEG : "\u00B0",
        _CHAR_MIN : "\u0027",
        _CHAR_SEC : "\u0022",
        _CHAR_SEP : "\u0020",
        _MAX_LON: 180,
        _MAX_LAT: 90,


        //--------------------------------------------------------------------------
        //  Methods
        //--------------------------------------------------------------------------

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

        _addActionEvents: function(){

            // Point Button
            this._pointButtonMeasure.onclick = lang.hitch(this, function() {
                this._graphicsLayer.removeAll();
                this._resetMeasureWidget();
                //hide Area & Line selector
                document.getElementById("measurementAreaSelector").style.display = 'none';
                document.getElementById("measurementLineSelector").style.display = 'none';
                // Clear cotents of the result div
                query("#measurementResultDisplayerLineArea")[0].innerHTML = "";
                //Show Point selector & Point Result div
                document.getElementById("measurementPointSelector").style.display = 'block';
                query("#measurementResultDisplayerPoint")[0].style.display = 'block';
                
                this._setActiveButton(this._pointButtonMeasure);
                this._enableCreatePoint(this._draw, this._view);
            });

            // Change event of Point Unit Combo box.
            on(this._unitPointSelect, "change", lang.hitch(this, function(event){
                    this._currentUnit = event.target.value;
                    if(this._currentGraphic && this._currentUnit){
                        this._calculatePoint(this._currentGraphic, this._currentUnit);
                    }
                }) 
            );

            // Polyline Button
            this._polyLineButtonMeasure.onclick = lang.hitch(this, function() {
                this._graphicsLayer.removeAll();
                this._resetMeasureWidget();
                //hide Area & Point selector
                document.getElementById("measurementAreaSelector").style.display = 'none';
                document.getElementById("measurementPointSelector").style.display = 'none';
                query("#measurementResultDisplayerPoint")[0].style.display = 'none';
                // Clear cotents of the result divs
                query("#measurementResultDisplayerLineArea")[0].innerHTML = "";
                query("#measurementResultDisplayerPoint_Lati")[0].innerHTML     = "";
                query("#measurementResultDisplayerPoint_Longi")[0].innerHTML    = ""
                //Show Line selector
                document.getElementById("measurementLineSelector").style.display = 'block';
                this._setActiveButton(this._polyLineButtonMeasure);
                this._enableCreateLine(this._draw, this._view);
            });

            // Change event of PolyLine Unit Combo box.
            on(this._unitLineSelect, "change", lang.hitch(this, function(event){
                    this._currentUnit = event.target.value;
                    if(this._currentGraphic && this._currentUnit){
                        this._calculateLength(this._currentGraphic, this._currentUnit);
                    }
                }) 
            );

            // Polygon Button
            this._polygonButtonMeasure.onclick = lang.hitch(this, function() {
                this._graphicsLayer.removeAll();
                this._resetMeasureWidget();
                //hide Line & Point selector
                document.getElementById("measurementLineSelector").style.display = 'none';
                document.getElementById("measurementPointSelector").style.display = 'none';
                query("#measurementResultDisplayerPoint")[0].style.display = 'none';
                // Clear cotents of the result div
                query("#measurementResultDisplayerLineArea")[0].innerHTML = "";
                query("#measurementResultDisplayerPoint_Lati")[0].innerHTML     = "";
                query("#measurementResultDisplayerPoint_Longi")[0].innerHTML    = ""
                //Show Area selector
                document.getElementById("measurementAreaSelector").style.display = 'block';
                this._setActiveButton(this._polygonButtonMeasure);
                this._enableCreatePolygon(this._draw, this._view);
            });

            // Change event of Polygon Unit Combo box.
            on(this._unitAreaSelect, "change", lang.hitch(this, function(event){
                    this._currentUnit = event.target.value;
                    if(this._currentGraphic && this._currentUnit){
                        this._calculateArea(this._currentGraphic, this._currentUnit);
                    }
                }) 
            );

            // Reset Button
            this._resetBtnMeasure.onclick = lang.hitch(this, function() {
                this._graphicsLayer.removeAll();
                // Clear cotents of the result divs
                query("#measurementResultDisplayerLineArea")[0].innerHTML       = "";
                query("#measurementResultDisplayerPoint_Lati")[0].innerHTML     = "";
                query("#measurementResultDisplayerPoint_Longi")[0].innerHTML    = ""
                // hide all 3- line, area, and point selectors & Point's latitude, longitude result div also.
                document.getElementById("measurementLineSelector").style.display = 'none';
                document.getElementById("measurementPointSelector").style.display = 'none';
                document.getElementById("measurementAreaSelector").style.display = 'none';
                query("#measurementResultDisplayerPoint")[0].style.display = 'none';
                
                // de-activate draw 
                this._draw.reset();
                this._resetMeasureWidget();
                this._setActiveButton();
            });
        },

        _resetMeasureWidget: function(){
            this._currentGraphic = null;
            this._currentUnit = null;
        },

        // 2D Point
        _enableCreatePoint: function (draw, view) {
            var action = draw.create("point");

            // focus the view to activate keyboard shortcuts for sketching
            view.focus();
          
            // PointDrawAction.cursor-update
            // Give a visual feedback to users as they move the pointer over the view

            action.on("cursor-update", lang.hitch(this,function(evt){
                    this._createPointGraphic(this, evt.coordinates);
                })
            );
          
            // PointDrawAction.draw-complete
            // Create a point when user clicks on the view or presses "C" key.
            action.on("draw-complete", lang.hitch(this,function(evt){
                    this._createPointGraphic(this, evt.coordinates);
                    this._setActiveButton();
                })
            );
        },

        _createPointGraphic: function (Ref, coordinates){
            //app.mapView.graphics.removeAll();
            
            this._graphicsLayer.removeAll();
            var point = {
              type: "point", // autocasts as /Point
              x: coordinates[0],
              y: coordinates[1],
              spatialReference: Ref._view.spatialReference
            };
          
            // var picSymbol =  new PictureMarkerSymbol({
            //     "url":"https://js.arcgis.com/3.23/esri/dijit/images/esriGreenPin16x26.png",
            //     "height":20,
            //     "width":20,
            //     "type":"esriPMS",
            //     "angle": -30,
            // });  

            var graphic = new Graphic({
              geometry: point,
              symbol: {
                type: "simple-marker", // autocasts as SimpleMarkerSymbol
                style: "square",
                color: "red",
                size: "16px",
                outline: { // autocasts as SimpleLineSymbol
                  color: [255, 255, 0],
                  width: 3
                }
              }
            });
            
            var pointUnit = dom.byId("measurementPointUnitSelect").value;

            this._currentGraphic = graphic;
            this._currentUnit = pointUnit;
            this._calculatePoint(graphic, pointUnit);

            Ref._graphicsLayer.add(graphic);
        },

        // Calculates Point's Latitude & Longitudes based on selected Unit (DMS | Degrees).
        _calculatePoint: function(graphic, pointUnit){
            var trgtUnit = "DD"; // Default unit
            if(graphic && pointUnit){
                var dd_xy_array = null;
                if(webMercatorUtils.canProject(graphic.geometry.spatialReference, SpatialReference.WGS84)){
                    dd_xy_array = webMercatorUtils.xyToLngLat(graphic.geometry.x, graphic.geometry.y);
                }

                if(pointUnit === "Degrees"){
                    query("#measurementResultDisplayerPoint_Longi")[0].innerHTML = (dd_xy_array[0]).toFixed(6);
                    query("#measurementResultDisplayerPoint_Lati")[0].innerHTML = (dd_xy_array[1]).toFixed(6);
                }else if(pointUnit === "DMS"){
                    query("#measurementResultDisplayerPoint_Lati")[0].innerHTML = this._dec2deg(dd_xy_array[1], this._MAX_LAT);
                    query("#measurementResultDisplayerPoint_Longi")[0].innerHTML = this._dec2deg(dd_xy_array[0], this._MAX_LON); 
                }
            }
        },

        _dec2deg: function(value, max) {
            var sign = value < 0 ? -1 : 1;
    
            var abs = Math.abs(Math.round(value * 1000000));
    
            if (abs > (max * 1000000)) {
                return NaN;
            }
    
            var dec = abs % 1000000 / 1000000;
            var deg = Math.floor(abs / 1000000) * sign;
            var min = Math.floor(dec * 60);
            var sec = (dec - min / 60) * 3600;
    
            var result = "";
    
            result += deg;
            result += this._CHAR_DEG;
            result += this._CHAR_SEP;
            result += min;
            result += this._CHAR_MIN;
            result += this._CHAR_SEP;
            result += sec.toFixed(2);
            result += this._CHAR_SEC;
    
            return result;
        },

        // 2D Polyine
        _enableCreateLine: function (draw, view) {
            // creates and returns an instance of PolyLineDrawAction 
            var action = draw.create("polyline");
    
            // focus the view to activate keyboard shortcuts for sketching
            view.focus();
    
            // listen to vertex-add event on the polyline draw action
            action.on("vertex-add", lang.hitch(this,function(evt){
                    this._createPolylineGraphic(this, evt);
                })
            );
    
            // listen to vertex-remove event on the polyline draw action
            action.on("vertex-remove", lang.hitch(this,function(evt){
                    this._createPolylineGraphic(this, evt);
                })
            );
    
            // listen to cursor-update event on the polyline draw action
            action.on("cursor-update", lang.hitch(this,function(evt){
                    this._createPolylineGraphic(this, evt);
                })
            );
    
            // listen to draw-complete event on the polyline draw action
            action.on("draw-complete", lang.hitch(this,function(evt){
                    this._createPolylineGraphic(this, evt);
                    this._setActiveButton();
                })
            );
    
        },

        // create a new graphic presenting the polyline that is being drawn on the view
        _createPolylineGraphic: function (Ref, evt) {
            var vertices = evt.vertices;
            // app.mapView.graphics.removeAll();
            this._graphicsLayer.removeAll();
            // a graphic representing the polyline that is being drawn
            var graphic = new Graphic({
              geometry: new Polyline({
                paths: vertices,
                spatialReference: Ref._view.spatialReference
              }),
              symbol: {
                type: "simple-line", // autocasts as new SimpleFillSymbol
                color: [4, 90, 141],
                width: 4,
                cap: "round",
                join: "round"
              }
            });
            //app.mapView.graphics.add(graphic);
            Ref._graphicsLayer.add(graphic);
            // calculate the length of the Polyline 
            var linearUnit = dom.byId("measurementLineUnitSelect").value; //document.getElementById("measurementLineUnitSelect").value;
            // var esriLinearUnit = "miles"; // Default unit
            // if(linearUnit)
            // {
            //   if(linearUnit === "Miles")
            //     esriLinearUnit = "miles";
            //   else if(linearUnit === "Kilometers")
            //     esriLinearUnit = "kilometers"
            //   else if(linearUnit === "Feet")
            //     esriLinearUnit = "feet"
            //   else if(linearUnit === "Meters")
            //     esriLinearUnit = "meters"
            //   else if(linearUnit === "Yards")
            //     esriLinearUnit = "yards"
            //   else if(linearUnit === "Nautical Miles")
            //     esriLinearUnit = "nautical-miles"
            // }
            //var length = geometryEngine.geodesicLength(graphic.geometry, esriLinearUnit); // Here units are coming from the value tag of the html selector
            // var divv = query("#measurementResultDisplayerLineArea")[0];
            //divv.innerHTML = this._calculateLength(graphic, esriLinearUnit, linearUnit) ; //Math.round(length*100)/100 + " "+linearUnit;

            this._currentGraphic = graphic;
            this._currentUnit = linearUnit;
            //this._currentUnitAlias = linearUnit;

            this._calculateLength(graphic, linearUnit);
            return graphic; 
        },

        _calculateLength: function(graphic, linearUnit){
            var esriLinearUnit = "miles"; // Default unit
            if(linearUnit)
            {
              if(linearUnit === "Miles")
                esriLinearUnit = "miles";
              else if(linearUnit === "Kilometers")
                esriLinearUnit = "kilometers"
              else if(linearUnit === "Feet")
                esriLinearUnit = "feet"
              else if(linearUnit === "Meters")
                esriLinearUnit = "meters"
              else if(linearUnit === "Yards")
                esriLinearUnit = "yards"
              else if(linearUnit === "Nautical Miles")
                esriLinearUnit = "nautical-miles"
            }
            var length = geometryEngine.geodesicLength(graphic.geometry, esriLinearUnit); // Here units are coming from the value tag of the html selector
            length = Math.round(length*100)/100 ;
            var divv = query("#measurementResultDisplayerLineArea")[0].innerHTML = length + " "+ linearUnit;
            return length;
        },




        // 2D Polygon

        _enableCreatePolygon: function (draw, view) {
            // create() will return a reference to an instance of PolygonDrawAction
            var action = draw.create("polygon");
    
            // focus the view to activate keyboard shortcuts for drawing polygons
            view.focus();
    
            // listen to vertex-add event on the action
            //action.on("vertex-add", this._drawPolygon);
            action.on("vertex-add", lang.hitch(this,function(evt){
                    this._drawPolygon(this, evt);
                })
            );
    
            // listen to cursor-update event on the action
            //action.on("cursor-update", this._drawPolygon);
            action.on("cursor-update", lang.hitch(this,function(evt){
                    this._drawPolygon(this, evt);
                })
            );
    
            // listen to vertex-remove event on the action
            //action.on("vertex-remove", this._drawPolygon);
            action.on("vertex-remove", lang.hitch(this,function(evt){
                    this._drawPolygon(this, evt);
                })
            );
    
            // *******************************************
            // listen to draw-complete event on the action
            // *******************************************
            //action.on("draw-complete", this._drawPolygon);
            action.on("draw-complete", lang.hitch(this,function(evt){
                    this._drawPolygon(this, evt);
                    this._setActiveButton();
                })
            );
        },

        // this function is called from the polygon draw action events
          // to provide a visual feedback to users as they are drawing a polygon
        _drawPolygon: function (Ref, evt) {
            var vertices = evt.vertices;

            //remove existing graphic
            //this._view.graphics.removeAll();
            this._graphicsLayer.removeAll();

            // create a new polygon
            var polygon = Ref._createPolygon(vertices);

            // create a new graphic representing the polygon, add it to the view
            var graphic = Ref._createPolygonGraphic(polygon);
            //this._view.graphics.add(graphic);
            Ref._graphicsLayer.add(graphic);

            var areaUnit =  dom.byId("measurementAreaUnitSelect").value; //document.getElementById("measurementAreaUnitSelect").value;
            this._currentGraphic = graphic;
            this._currentUnit = areaUnit;

            this._calculateArea(graphic, areaUnit);
            
            // var esriAreaUnit = "acres"; // Default unit
            // if(areaUnit)
            // {
            //   if(areaUnit === "Acres")
            //     esriAreaUnit = "acres";
            //   else if(areaUnit === "Sq Miles")
            //     esriAreaUnit = "square-miles"
            //   else if(areaUnit === "Sq Kilometers")
            //     esriAreaUnit = "square-kilometers"
            //   else if(areaUnit === "Hectares")
            //     esriAreaUnit = "hectares"
            //   else if(areaUnit === "Sq Yards")
            //     esriAreaUnit = "square-yards"
            //   else if(areaUnit === "Sq Feet")
            //     esriAreaUnit = "square-feet" 
            //   else if(areaUnit === "Sq Meters")
            //     esriAreaUnit = "square-meters"
            // }

            // calculate the area of the polygon
            // var area = geometryEngine.geodesicArea(polygon, esriAreaUnit);
            // if (area < 0) {
            //   // simplify the polygon if needed and calculate the area again
            //   var simplifiedPolygon = geometryEngine.simplify(polygon);
            //   if (simplifiedPolygon) {
            //     area = geometryEngine.geodesicArea(simplifiedPolygon, esriAreaUnit);
            //   }
            // }

            // var divv = query("#measurementResultDisplayerLineArea")[0];
            // divv.innerHTML = Math.round(area*100)/100 + " "+areaUnit;

            // start displaying the area of the polygon
            //labelAreas(polygon, area);
          },

        _calculateArea: function(graphic, areaUnit){
            var esriAreaUnit = "acres"; // Default unit
            if(areaUnit)
            {
              if(areaUnit === "Acres")
                esriAreaUnit = "acres";
              else if(areaUnit === "Sq Miles")
                esriAreaUnit = "square-miles"
              else if(areaUnit === "Sq Kilometers")
                esriAreaUnit = "square-kilometers"
              else if(areaUnit === "Hectares")
                esriAreaUnit = "hectares"
              else if(areaUnit === "Sq Yards")
                esriAreaUnit = "square-yards"
              else if(areaUnit === "Sq Feet")
                esriAreaUnit = "square-feet" 
              else if(areaUnit === "Sq Meters")
                esriAreaUnit = "square-meters"
            }
            // calculate the area of the polygon
            var area = geometryEngine.geodesicArea(graphic.geometry, esriAreaUnit);
            if (area < 0) {
                // simplify the polygon if needed and calculate the area again
                var simplifiedPolygon = geometryEngine.simplify(graphic.geometry);
                if (simplifiedPolygon) {
                    area = geometryEngine.geodesicArea(simplifiedPolygon, esriAreaUnit);
                }
            }
            query("#measurementResultDisplayerLineArea")[0].innerHTML = Math.round(area*100)/100 + " "+areaUnit; // Div for length & area is same.
            return area;
        },

        // create a polygon using the provided vertices
        _createPolygon: function (vertices) {
            return new Polygon({
                rings: vertices,
                spatialReference: this._view.spatialReference
            });
        },

        // create a new graphic representing the polygon that is being drawn on the view
        _createPolygonGraphic: function (polygon) {
            graphic = new Graphic({
                geometry: polygon,
                symbol: {
                    type: "simple-fill", // autocasts as SimpleFillSymbol
                    color: [178, 102, 234, 0.8],
                    style: "solid",
                    outline: { // autocasts as SimpleLineSymbol
                        color: [255, 255, 255],
                        width: 2
                    }
                }
            });
            return graphic;
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


    }) // /. End of declare
});