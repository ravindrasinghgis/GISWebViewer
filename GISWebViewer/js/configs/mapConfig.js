
/*******************************************
 * 
 * Title        :     ViewManager.js
 * Description  :     Configuration file regarding Map related items, eg. Bookmarks, Layers etc.
 * Auther       :     Ravindra Singh
 * E-Mail       :     r.singh@openware.com.kw / rasingh@kockw.com
 * Date         :     06/02/2018
 * History      :
 *******************************************/

define([], function () {
    return {
        map: [
            {
                center: [47.4818,29.3117], // Kuwait Location
                scale:1000000
            }
        ],
        bookmarks: [
            {
                extent: {
                    xmin:5339734.473385565,
                    ymin:3375733.4371235599,
                    xmax:5339969.4614355518,
                    ymax:3376111.2979079382,
                    spatialReference: {
                        wkid: 102100,
                        latestWkid:3857
                    }
                },
                name: "South & East Site"
            },
            {
                extent: {
                    xmin:5304981.4147237334,
                    ymin:3365839.4788327753,
                    xmax:5305229.9379569422,
                    ymax:3366239.1041917754,
                    spatialReference:{
                        wkid:102100,
                        latestWkid:3857
                    }
                },
                name: "West Site"
            },
            {
                extent: {
                    xmin:5312762.0342065766,
                    ymin:3478575.2339570918,
                    xmax:5312982.4881515224,
                    ymax:3478929.7239005649,
                    spatialReference:{
                        wkid:102100,
                        latestWkid:3857
                    }
                },
                name: "North Site"
            }
        ],
        baseMaps:[
            
        ],
        operationalLayers: [
            {
                type: 'dynamic',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer',
                title: "World Transportation",
                options: {
                    id: 'World Transportation',
                    opacity: 1.0,
                    visible: true,
                    outFields: ['*']
                }
            },
            {
                type: 'dynamic',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer',
                title: "World Transportation",
                options: {
                    id: 'World Transportation',
                    opacity: 1.0,
                    visible: true,
                    outFields: ['*']
                }
            },
            {
                type: 'dynamic',
                url: 'https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Housing_Density/MapServer',
                title: "Newyork Housing",
                options: {
                    id: 'Newyork Housing',
                    opacity: 1.0,
                    visible: true,
                    outFields: ['*']
                }
            },
            {
                type: 'dynamic',
                url: 'https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Footprint/MapServer',
                title: "Newyork Footprint",
                options: {
                    id: 'Newyork Footprint',
                    opacity: 1.0,
                    visible: true,
                    outFields: ['*']
                }
            },
            {
                type: 'dynamic',
                url: 'https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/New_York_Open_Space/MapServer',
                title: "Newyork Openspace",
                options: {
                    id: 'Newyork Openspace',
                    opacity: 1.0,
                    visible: true,
                    outFields: ['*']
                }
            }
        ],
        utilityServices: [
            {
                type: 'Print',
                url: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task'
            },
            {
                type: '',
                url: ''  
            } 
        ]
    };
});
