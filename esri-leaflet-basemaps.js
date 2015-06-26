/*! esri-leaflet - v1.0.0-rc.7 - 2015-05-01
*   Copyright (c) 2015 Environmental Systems Research Institute, Inc.
*   Apache License*/
(function (factory) {
  //define an AMD module that relies on 'leaflet'
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], function (L) {
      return factory(L);
    });
  //define a common js module that relies on 'leaflet'
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(require('leaflet'));
  }

  if(typeof window !== 'undefined' && window.L){
    factory(window.L);
  }
}(function (L) {

var EsriLeaflet={VERSION:"1.0.0-rc.7",Layers:{},Services:{},Controls:{},Tasks:{},Util:{},Support:{CORS:!!(window.XMLHttpRequest&&"withCredentials"in new XMLHttpRequest),pointerEvents:""===document.documentElement.style.pointerEvents}};"undefined"!=typeof window&&window.L&&(window.L.esri=EsriLeaflet),function(a){function b(a){var b="";a.f=a.f||"json";for(var c in a)if(a.hasOwnProperty(c)){var d,e=a[c],f=Object.prototype.toString.call(e);b.length&&(b+="&"),d="[object Array]"===f?"[object Object]"===Object.prototype.toString.call(e[0])?JSON.stringify(e):e.join(","):"[object Object]"===f?JSON.stringify(e):"[object Date]"===f?e.valueOf():e,b+=encodeURIComponent(c)+"="+encodeURIComponent(d)}return b}function c(a,b){var c=new XMLHttpRequest;return c.onerror=function(){c.onreadystatechange=L.Util.falseFn,a.call(b,{error:{code:500,message:"XMLHttpRequest error"}},null)},c.onreadystatechange=function(){var d,e;if(4===c.readyState){try{d=JSON.parse(c.responseText)}catch(f){d=null,e={code:500,message:"Could not parse response as JSON. This could also be caused by a CORS or XMLHttpRequest error."}}!e&&d.error&&(e=d.error,d=null),c.onerror=L.Util.falseFn,a.call(b,e,d)}},c}var d=0;window._EsriLeafletCallbacks={},a.Request={request:function(a,d,e,f){var g=b(d),h=c(e,f),i=(a+"?"+g).length;if(2e3>=i&&L.esri.Support.CORS)h.open("GET",a+"?"+g),h.send(null);else if(i>2e3&&L.esri.Support.CORS)h.open("POST",a),h.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),h.send(g);else{if(2e3>=i&&!L.esri.Support.CORS)return L.esri.Request.get.JSONP(a,d,e,f);if(console&&console.warn)return void console.warn("a request to "+a+" was longer then 2000 characters and this browser cannot make a cross-domain post request. Please use a proxy http://esri.github.io/esri-leaflet/api-reference/request.html")}return h},post:{XMLHTTP:function(a,d,e,f){var g=c(e,f);return g.open("POST",a),g.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),g.send(b(d)),g}},get:{CORS:function(a,d,e,f){var g=c(e,f);return g.open("GET",a+"?"+b(d),!0),g.send(null),g},JSONP:function(a,c,e,f){var g="c"+d;c.callback="window._EsriLeafletCallbacks."+g;var h=L.DomUtil.create("script",null,document.body);return h.type="text/javascript",h.src=a+"?"+b(c),h.id=g,window._EsriLeafletCallbacks[g]=function(a){if(window._EsriLeafletCallbacks[g]!==!0){var b,c=Object.prototype.toString.call(a);"[object Object]"!==c&&"[object Array]"!==c&&(b={error:{code:500,message:"Expected array or object as JSONP response"}},a=null),!b&&a.error&&(b=a,a=null),e.call(f,b,a),window._EsriLeafletCallbacks[g]=!0}},d++,{id:g,url:h.src,abort:function(){window._EsriLeafletCallbacks._callback[g]({code:0,message:"Request aborted."})}}}}},a.get=a.Support.CORS?a.Request.get.CORS:a.Request.get.JSONP,a.post=a.Request.post.XMLHTTP,a.request=a.Request.request}(EsriLeaflet),function(a){var b="https:"!==window.location.protocol?"http:":"https:";a.Layers.BasemapLayer=L.TileLayer.extend({statics:{TILES:{Streets:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",attributionUrl:"https://static.arcgis.com/attribution/World_Street_Map",options:{attriWidth:"4em",hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:17,subdomains:["server","services"],attribution:"Esri"}},Topographic:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",attributionUrl:"https://static.arcgis.com/attribution/World_Topo_Map",options:{attriWidth:"4em",hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:17,subdomains:["server","services"],attribution:"Esri"}},Oceans:{urlTemplate:b+"//{s}.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",attributionUrl:"https://static.arcgis.com/attribution/Ocean_Basemap",options:{attriWidth:"4em",hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri"}},OceansLabels:{urlTemplate:b+"//{s}.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"]}},NationalGeographic:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri"}},DarkGray:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri, DeLorme, HERE"}},DarkGrayLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"]}},Gray:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"],attribution:"Esri, NAVTEQ, DeLorme"}},GrayLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:16,subdomains:["server","services"]}},Imagery:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",options:{attriWidth:"4em",hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:18,subdomains:["server","services"],attribution:"Esri, DigitalGlobe, GeoEye, i-cubed, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community"}},ImageryLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:18,subdomains:["server","services"]}},ImageryTransportation:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:18,subdomains:["server","services"]}},ShadedRelief:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:13,subdomains:["server","services"],attribution:"Esri, NAVTEQ, DeLorme"}},ShadedReliefLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:12,subdomains:["server","services"]}},Terrain:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!1,logoPosition:"bottomright",minZoom:1,maxZoom:13,subdomains:["server","services"],attribution:"Esri, USGS, NOAA"}},TerrainLabels:{urlTemplate:b+"//{s}.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}",options:{hideLogo:!0,logoPosition:"bottomright",minZoom:1,maxZoom:13,subdomains:["server","services"]}}}},initialize:function(b,c){var d;if("object"==typeof b&&b.urlTemplate&&b.options)d=b;else{if("string"!=typeof b||!a.BasemapLayer.TILES[b])throw new Error('L.esri.BasemapLayer: Invalid parameter. Use one of "Streets", "Topographic", "Oceans", "OceansLabels", "NationalGeographic", "Gray", "GrayLabels", "DarkGray", "DarkGrayLabels", "Imagery", "ImageryLabels", "ImageryTransportation", "ShadedRelief", "ShadedReliefLabels", "Terrain" or "TerrainLabels"');d=a.BasemapLayer.TILES[b]}var e=L.Util.extend(d.options,c);L.TileLayer.prototype.initialize.call(this,d.urlTemplate,L.Util.setOptions(this,e)),d.attributionUrl&&this._getAttributionData(d.attributionUrl),this._logo=new a.Controls.Logo({position:this.options.logoPosition})},onAdd:function(a){this.options.hideLogo||a._hasEsriLogo||(this._logo.addTo(a),a._hasEsriLogo=!0),L.TileLayer.prototype.onAdd.call(this,a),a.on("moveend",this._updateMapAttribution,this);if(this.options.attriWidth && !a._elmAttribution)a.on('layeradd',this._bindAttribution,this);if(typeof a.options.maxZoom == "undefined")a.options.maxZoom = this.options.maxZoom;if(a.options.maxZoom > this.options.maxZoom)a.options.maxZoom = this.options.maxZoom;},onRemove:function(a){this._logo&&this._logo._container&&(a.removeControl(this._logo),a._hasEsriLogo=!1),L.TileLayer.prototype.onRemove.call(this,a),a.off("moveend",this._updateMapAttribution,this);if(this.options.attriWidth && a._elmAttribution){L.DomEvent.off(a._elmAttribution,'click',this._eventAttribution,this);a.off('layeradd', this._bindAttribution, this);a._elmAttribution = false;}},getAttribution:function(){if(!this.options.attribution)return "";var a='<span class="esri-attributions" style="line-height:14px; text-overflow:ellipsis;overflow:hidden; display:inline-block;cursor:pointer;">'+this.options.attribution+"</span>";return a},_getAttributionData:function(a){L.esri.Request.get.JSONP(a,{},L.Util.bind(function(a,b){this._attributions=[];for(var c=0;c<b.contributors.length;c++)for(var d=b.contributors[c],e=0;e<d.coverageAreas.length;e++){var f=d.coverageAreas[e],g=new L.LatLng(f.bbox[0],f.bbox[1]),h=new L.LatLng(f.bbox[2],f.bbox[3]);this._attributions.push({attribution:d.attribution,score:f.score,bounds:new L.LatLngBounds(g,h),minZoom:f.zoomMin,maxZoom:f.zoomMax})}this._attributions.sort(function(a,b){return b.score-a.score}),this._updateMapAttribution()},this))},_updateMapAttribution:function(){if(this._map&&this._map.attributionControl&&this._attributions){for(var a="",b=this._map.getBounds(),c=this._map.getZoom(),d=0;d<this._attributions.length;d++){var e=this._attributions[d],f=e.attribution;!a.match(f)&&b.intersects(e.bounds)&&c>=e.minZoom&&c<=e.maxZoom&&(a+=", "+f)}a=a.substr(2);var g=this._map.attributionControl._container.querySelector(".esri-attributions");g.innerHTML=a,this.fire("attributionupdated",{attribution:a})}},_bindAttribution: function(){if(this._map && this._map.attributionControl){var map = this._map.attributionControl._container;for(var i = 0; i < map.children.length; i++){if(map.children[i].className == "esri-attributions"){this._map._elmAttribution = map.children[i];this._map._elmAttribution.style.width = this.options.attriWidth;this._map._elmAttribution.style.whiteSpace = "nowrap";L.DomEvent.on(this._map._elmAttribution,'click',this._eventAttribution,this);break;}}}},_eventAttribution: function(e){e.preventDefault();var elm = e.target;if(elm.style.whiteSpace == "nowrap") {elm.style.width = "auto";elm.style.whiteSpace = "normal";}else{elm.style.width = this.options.attriWidth;elm.style.whiteSpace = "nowrap";}}}),a.BasemapLayer=a.Layers.BasemapLayer,a.Layers.basemapLayer=function(b,c){return new a.Layers.BasemapLayer(b,c)},a.basemapLayer=function(b,c){return new a.Layers.BasemapLayer(b,c)}}(EsriLeaflet),EsriLeaflet.Controls.Logo=L.Control.extend({options:{position:"bottomright",marginTop:0,marginLeft:0,marginBottom:0,marginRight:0},onAdd:function(){var a=L.DomUtil.create("div","esri-leaflet-logo");return a.style.marginTop=this.options.marginTop,a.style.marginLeft=this.options.marginLeft,a.style.marginBottom=this.options.marginBottom,a.style.marginRight=this.options.marginRight,a.innerHTML=this._adjustLogo(this._map._size),this._map.on("resize",function(b){a.innerHTML=this._adjustLogo(b.newSize)},this),a},_adjustLogo:function(a){return a.x<=600||a.y<=600?'<a href="https://developers.arcgis.com" style="border: none;"><img src="https://js.arcgis.com/3.13/esri/images/map/logo-sm.png" alt="Powered by Esri" style="border: none;"></a>':'<a href="https://developers.arcgis.com" style="border: none;"><img src="https://js.arcgis.com/3.13/esri/images/map/logo-med.png" alt="Powered by Esri" style="border: none;"></a>'}}),EsriLeaflet.Controls.logo=function(a){return new L.esri.Controls.Logo(a)};
//# sourceMappingURL=esri-leaflet-basemaps.js.map

  return EsriLeaflet;
}));