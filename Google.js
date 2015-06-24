/*
 * Google layer using Google Maps API
    Pavel Shramov
    brunob <brunobergot@gmail.com>
    https://github.com/shramov/leaflet-plugins
 */

/* global google: true */

L.Google = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		opacity: 1,
		continuousWorld: false,
		noWrap: false,
		mapOptions: {
			backgroundColor: '#dddddd'
		}
	},
	// Possible types: SATELLITE, ROADMAP, HYBRID, TERRAIN
	initialize: function(type, options) {
		L.Util.setOptions(this, options);

		this._ready = google.maps.Map !== undefined;
		if (!this._ready) L.Google.asyncWait.push(this);

		this._type = type || 'SATELLITE';
	},
	onAdd: function(map, insertAtTheBottom) {
		this._map = map;
		this._insertAtTheBottom = insertAtTheBottom;

		// create a container div for tiles
		this._initContainer();
		this._initMapObject();

		// set up events
		map.on('viewreset', this._resetCallback, this);

		this._limitedUpdate = L.Util.limitExecByInterval(this._update, 150, this);
		map.on('move', this._update, this);

		map.on('zoomanim', this._handleZoomAnim, this);

		//20px instead of 1em to avoid a slight overlap with google's attribution
//		map._controlCorners.bottomright.style.marginBottom = '20px';

        map.attributionControl._container.innerHTML += "&nbsp; ";

        var that = this;
        this.elmAttribute = [];
        var eventFindAttri = google.maps.event.addListener(this._google, 'tilesloaded', function() {
            that._findAttribut();
            google.maps.event.removeListener(eventFindAttri);
        });
        this.eventResizeAttri = google.maps.event.addListener(this._google, 'idle', function() {
            that._resizeAttribut();
        });

        this._reset();
        this._update();
	},
	onRemove: function(map) {
		map._container.removeChild(this._container);

		map.off('viewreset', this._resetCallback, this);

		map.off('move', this._update, this);

		map.off('zoomanim', this._handleZoomAnim, this);

        map._controlContainer.removeChild(this.popupAttribut);
        google.maps.event.removeListener(this.eventResizeAttri);

//		map._controlCorners.bottomright.style.marginBottom = '0em';
	},
	getAttribution: function() {
		return this.options.attribution;
	},
	setOpacity: function(opacity) {
		this.options.opacity = opacity;
		if (opacity < 1) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},
	setElementSize: function(e, size) {
		e.style.width = size.x + 'px';
		e.style.height = size.y + 'px';
	},
    _findAttribut: function() {
        var elm = document.getElementById(this._container.id).firstChild;
        for(var i = 2; i < elm.childNodes.length; i++) {
            if(/gmnoprint|gm-style-cc/.test(elm.childNodes[i].className)) {
                if(elm.childNodes[i].className == "gmnoprint") {
                    this.elmAttribut = elm.childNodes[i];
                    elm.childNodes[i].firstChild.firstChild.style.display = "none";
                } else
                    elm.childNodes[i].firstChild.style.display = "none";
                elm.childNodes[i].style.position = "";
                elm.childNodes[i].style.display = "inline-block";
                this.elmAttribute.push(elm.childNodes[i]);
                this._map.attributionControl._container.appendChild(elm.childNodes[i]);
                if(typeof elm.childNodes[i] == "object" && !elm.childNodes[i].className) {
                    this.popupAttribut = elm.childNodes[i];
                    this._map._controlContainer.appendChild(this.popupAttribut);
                }
                i--;
            }
        }
//        var that = this;
//        setTimeout(function(){that._resizeAttribut();},500)
    },
    _resizeAttribut: function() {
        if(this.elmAttribut) {
            var elm_span = this.elmAttribut.getElementsByTagName("span")[0];
            var elm_a = this.elmAttribut.getElementsByTagName("a")[0];
            if(typeof elm_span == "object" && typeof elm_a == "object") {
                this.elmAttribut.style.width = "";
                elm_a.style.display = "";
                elm_span.style.display = "none";
            }
        }
        if(this.elmAttribute) {
            for(var i = 0; i < this.elmAttribute.length; i++) {
                if(this.elmAttribute[i].style.display != "none")
                    this.elmAttribute[i].style.display = "inline-block";
            }
        }
    },
	_initContainer: function() {
		var tilePane = this._map._container,
			first = tilePane.firstChild;
		if (!this._container) {
			this._container = L.DomUtil.create('div', 'leaflet-google-layer leaflet-top leaflet-left');
			this._container.id = '_GMapContainer_' + L.Util.stamp(this);
			this._container.style.zIndex = 'auto';
		}

		tilePane.insertBefore(this._container, first);

		this.setOpacity(this.options.opacity);
		this.setElementSize(this._container, this._map.getSize());
	},
	_initMapObject: function() {
		if (!this._ready) return;
		this._google_center = new google.maps.LatLng(0, 0);
		var map = new google.maps.Map(this._container, {
			center: this._google_center,
			zoom: 0,
			tilt: 0,
			mapTypeId: google.maps.MapTypeId[this._type],
			disableDefaultUI: true,
			keyboardShortcuts: false,
			draggable: false,
			disableDoubleClickZoom: true,
			scrollwheel: false,
			streetViewControl: false,
			styles: this.options.mapOptions.styles,
			backgroundColor: this.options.mapOptions.backgroundColor
		});

		var _this = this;
		this._reposition = google.maps.event.addListenerOnce(map, 'center_changed',
			function() { _this.onReposition(); });
		this._google = map;

		google.maps.event.addListenerOnce(map, 'idle',
			function() { _this._checkZoomLevels(); });
        google.maps.event.addListenerOnce(map, 'tilesloaded',
            function() { _this.fire('load'); });
		//Reporting that map-object was initialized.
		this.fire('MapObjectInitialized', { mapObject: map });
	},
	_checkZoomLevels: function() {
		//setting the zoom level on the Google map may result in a different zoom level than the one requested
		//(it won't go beyond the level for which they have data).
		// verify and make sure the zoom levels on both Leaflet and Google maps are consistent
		if (this._google.getZoom() !== this._map.getZoom()) {
			//zoom levels are out of sync. Set the leaflet zoom level to match the google one
			this._map.setZoom( this._google.getZoom() );
		}
	},
	_resetCallback: function(e) {
		this._reset(e.hard);
	},
	_reset: function(clearOldContainer) {
		this._initContainer();
	},
	_update: function(e) {
		if (!this._google) return;
		this._resize();

		var center = this._map.getCenter();
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(Math.round(this._map.getZoom()));

		this._checkZoomLevels();
	},
	_resize: function() {
		var size = this._map.getSize();
		if (this._container.style.width === size.x &&
				this._container.style.height === size.y)
			return;
		this.setElementSize(this._container, size);

		this.onReposition();
	},
	_handleZoomAnim: function (e) {
		var center = e.center;
		var _center = new google.maps.LatLng(center.lat, center.lng);

		this._google.setCenter(_center);
		this._google.setZoom(Math.round(e.zoom));
	},
	onReposition: function() {
		if (!this._google) return;
		google.maps.event.trigger(this._google, 'resize');
	}
});

L.Google.asyncWait = [];
L.Google.asyncInitialize = function() {
	var i;
	for (i = 0; i < L.Google.asyncWait.length; i++) {
		var o = L.Google.asyncWait[i];
		o._ready = true;
		if (o._container) {
			o._initMapObject();
			o._update();
		}
	}
	L.Google.asyncWait = [];
};
