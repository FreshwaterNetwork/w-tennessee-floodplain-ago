// create map and layers for app
require([
   "esri/WebMap",
   "esri/views/MapView",
   "esri/widgets/BasemapGallery",
   "esri/widgets/Expand",
   "esri/widgets/BasemapGallery/support/PortalBasemapsSource",
   "esri/widgets/Search",
   "esri/widgets/Legend", 
   "esri/PopupTemplate",
   "esri/tasks/QueryTask", 
   "esri/tasks/support/Query",
   "esri/layers/GraphicsLayer",
   "esri/core/watchUtils"],
function(
   WebMap,
   MapView,
   BasemapGallery,
   Expand,
   PortalSource,
   Search,
   Legend,
   PopupTemplate, 
   QueryTask,
   Query,
   GraphicsLayer,
   watchUtils) {

   app.webmap = new WebMap({
      portalItem: {  // autocasts as esri/portal/PortalItem
         id: "deb8c1e403314b168a4b355041c602bf"
      }
   });

   //create map view
   app.view = new MapView({
      container: "viewDiv",
      center: [-168, 46],
      zoom: 3,
      map: app.webmap,
      // add popup window to map view for map clicks
      popup: {
         collapseEnabled: false,
         autoOpenEnabled: false,
         dockEnabled: true,
         dockOptions: {
            buttonEnabled: false,
            breakpoint: false
         }
      }
   });

   //create basemap widget
   const allowedBasemapTitles = ["Topographic", "Imagery Hybrid", "Streets"];
   const source = new PortalSource({
      // filtering portal basemaps
      filterFunction: (basemap) => allowedBasemapTitles.indexOf(basemap.portalItem.title) > -1
   });
   var basemapGallery = new BasemapGallery({
      view: app.view,
      source: source,
      container: document.createElement("div")
   });
   var bgExpand = new Expand({
      view: app.view,
      content: basemapGallery
   });
   app.view.ui.add(bgExpand, {
      position: "top-right"
   });
   // close expand when basemap is changed
   app.webmap.watch('basemap.title', function(newValue, oldValue, property, object){
      bgExpand.collapse();
   });

   //create search widget
   const searchWidget = new Search({
      view: app.view,
      locationEnabled: false,
      container: document.createElement("div")
   });
   var srExpand = new Expand({
      view: app.view,
      content: searchWidget
   })
   app.view.ui.add(srExpand, {
      position: "top-right"
   })

   // move zoom controls to top right
   app.view.ui.move([ "zoom" ], "top-right");

   // graphics layer for map click graphics
   app.resultsLayer = new GraphicsLayer({title: "mapclick",visible:true});
   // add layers to map
   app.webmap.when(function(){
      app.webmap.add(app.resultsLayer)
   });
   // create legend
   app.legend = new Legend({
      view: app.view,
      container: document.createElement("div")
   })
   app.lgExpand = new Expand({
      view: app.view,
      content: app.legend
   })
   app.view.ui.add(app.lgExpand,{
      position: "bottom-left"
   })

   // change legend based on window size
   var x = window.matchMedia("(max-width: 700px)")
   mobilePortrait(x) // Call listener function at run time
   x.addListener(mobilePortrait) // Attach listener function on state changes

   // change legend based on window size
   var y = window.matchMedia("(orientation:landscape)")
   mobileLandscape(y) // Call listener function at run time
   y.addListener(mobileLandscape) // Attach listener function on state changes

   // listen for poup close button
   watchUtils.whenTrue(app.view.popup,'visible', function(){
      watchUtils.whenFalseOnce(app.view.popup,'visible', function(){
         app.resultsLayer.removeAll();
      })
   })

   // call event listener for map clicks
   mapClick();

   // trigger button clicks on startup
   document.querySelectorAll("#top-controls input[name='huc']").forEach(input => {
      if (input.value == app.obj.hucLayer){
         input.click();
      }
   })
   document.querySelectorAll("#top-controls input[name='floodFreq']").forEach(input => {
      if (input.value == app.obj.floodFreq){
         input.click();
      }
   })

   // trigger control clicks from app.obj
   buildFromState();
});

function clearGraphics(){
   // app.map.layers.removeAll();
}

function mobilePortrait(x){
   if (x.matches) { 
      app.lgExpand.collapse();
      app.mobile = true;
   } else {
      app.lgExpand.expand();
      app.mobile = false;
   }
}
function mobileLandscape(y){
   if (y.matches) { 
      app.lgExpand.collapse();
   } 
}
