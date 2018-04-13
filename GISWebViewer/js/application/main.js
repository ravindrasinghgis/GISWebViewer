/*******************************************
 * 
 * Title        :     main.js
 * Description  :     This is the startup DOJO custom javaScript class.
 * Auther       :     Ravindra Singh
 * E-Mail       :     r.singh@openware.com.kw
 * Date         :     
 *******************************************/

define([
    "application/view/ViewManager",
    "application/main",

    "dojo/dom",
    "dojo/query",
    "dojo/_base/declare",
    "dojo/domReady!"
  ], function (
    ViewManager, main, dom, query, declare
  ) {
  
    //--------------------------------------------------------------------------
    //  Static Variables
    //--------------------------------------------------------------------------
  
    //var VIEW_TIMEOUT = 10000;
  
    return declare(null, {
  
      //--------------------------------------------------------------------------
      //  Lifecycle
      //--------------------------------------------------------------------------
  
      constructor: function (mapViewDiv) {
  
        console.info("js/application/main.js - Constructor called... = " + mapViewDiv);
        this._mapViewDiv = mapViewDiv; 
      },
  
      //--------------------------------------------------------------------------
      //  Variables
      //--------------------------------------------------------------------------
  
      _appViewManager: null,
      _mapViewDiv: null,
      
  
      //--------------------------------------------------------------------------
      //  Public Members
      //--------------------------------------------------------------------------
  
      init: function () {
        console.info("js/application/main.js - calling init method...");
        this._appViewManager = new ViewManager(this._mapViewDiv);
        //var view = this._appViewManager.getView();
        //console.info("view from View manager= "+ view);
      }
  
      //--------------------------------------------------------------------------
      //  Private Methods
      //--------------------------------------------------------------------------
  
      /*
      _yourCustomeMethod: function(boilerplate) {
        
      },
      */
  
    });
  });