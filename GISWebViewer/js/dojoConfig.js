/* global dojoConfig:true */
var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")); // This gives the "/<your app Name>"
console.log("Package = "+ package_path);
dojoConfig = {
  async: true,
  isDebug: true,
  packages: [
  {
    //name: "dojo",
    //location: "https://js.arcgis.com/4.2/dojo"
  },
  {
    name: "bootstrap",
    location: "https://esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap"
  },
  {
    name: "calcite-maps",
    location: "https://esri.github.io/calcite-maps/dist/js/dojo"
  }, 
  {
    name: "application",
    location: package_path + "/js/application",
    main: "main"
  },{
    name: "scripts",
    location: package_path + "/Scripts"
  },{
    name: "configs",
    location: package_path + "/js/configs"
  }],
  // Timeout after 10 seconds
    waitSeconds: 10,
    aliases: [
        // Instead of having to call external script libraries using script tag in HTML page, call it here, .js extension is automatically added by DOJO.
        ["jquery", "scripts/jquery-3.3.1"],
        ["knockout", "scripts/knockout-3.4.2"],

        // Call custome configuration files.
        ["appConfig", "configs/appConfig"],
        ["mapConfig", "configs/mapConfig"]
    ]

};
if (location.search.match(/locale=([\w-]+)/)) {
  dojoConfig.locale = RegExp.$1;
  console.log("dojoConfig.locale = "+ dojoConfig.locale);
}

