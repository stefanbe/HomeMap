<?php if(!defined('IS_CMS')) die();

class HomeMap extends Plugin {

    private $para;
    private $useGoogle = array();
    private $pluginName = "HomeMap";
    private $lang;

    public function getContent($value) {

        $this->setPara($value);

        global $CMS_CONF;
        $this->langcms = new Language($this->PLUGIN_SELF_DIR."lang/conf_".$CMS_CONF->get("cmslanguage").".txt");
        $la = substr($CMS_CONF->get("cmslanguage"),0,2);

        if(!$this->para["infotext"] and $this->para["linktext"]) {
            if($this->para["google"])
                return $this->getLink('https://www.google.de/maps/dir//'.$this->para["google"].'/');
            if($this->para["long"] and $this->para["lat"]) {
                if($this->para["openrouteservice"]) {
                    return $this->getLink('http://www.openrouteservice.org/?pos='.$this->para["long"].','.$this->para["lat"].'&amp;wp=0,0,'.$this->para["long"].','.$this->para["lat"].'&amp;zoom='.$this->para["zoom"].'&amp;lang='.$la.'&amp;routeLang='.$la);
                } elseif($this->para["openstreetmap"])
                    return $this->getLink('http://www.openstreetmap.org/directions?engine=osrm_car&amp;route=%3B'.$this->para["lat"].'%2C'.$this->para["long"].'#map='.$this->para["zoom"].'/'.$this->para["lat"].'/'.$this->para["long"]);
            }
            return NULL;
        }

        if(!isset($GLOBALS['map_id'])) $GLOBALS['map_id'] = 1; else $GLOBALS['map_id']++;

        return $this->getScript($GLOBALS['map_id'],$la);
    }

    private function setPara($value) {
        $this->para = array("lat" => false,"long" => false,"kml" => false,"gpx" => false,"height" => "350px","infotext" => false,"zoom" => 10,"openrouteservice" => false,"openstreetmap" => false,"google" => false,"satellite" => false,"layers" => false,"linktext" => false,"full" => false,"openinfo" => false,"scale" => false,"icon" => false,"iconsize" => false);

        $this->useGoogle['sat'] = false;
        $this->useGoogle['road'] = false;
            if($this->settings->get("usegooglesat") == "true")
                $this->useGoogle['sat'] = true;
            if($this->settings->get("usegoogleroad") == "true")
                $this->useGoogle['road'] = true;

        global $specialchars;
        $value = str_replace("-html_nbsp~"," ",$value);
        $value = $this->makeUserParaArray($value);
        foreach($value as $key => $val) {
            if($key === "infotext" or $key === "linktext") {
                $val = preg_replace("/&#94;&#(\d{2,5});/","&#$1;",$val);
                $val = str_replace(array("&lt;","&gt;","-html_br~","\n","\r","  "),array("<",">","<br />","","","&nbsp;&nbsp;"),$val);
                if($key === "infotext")
                    $val = str_replace(array("</","<br />",'"'),array("<\/","<br \/>",'\"'),$val);
                $this->para[$key] = $val;
                continue;
            }
            $val = $specialchars->decodeProtectedChr($val);
            $val = trim(str_replace("-html_br~","",$val));
            if(in_array($key,array("lat","long","zoom")) and is_numeric($val)) {
                $this->para[$key] = $val;
            } elseif($key === "google") {
                $val = preg_replace("/[ ][ ]*/"," ",$val);
                $this->para[$key] = $specialchars->replaceSpecialChars(str_replace(" , ",",",$val),false);
            } elseif($key === "height") {
                if(ctype_digit($val))
                    $val .= "px";
                $this->para[$key] = $val;
            } elseif($val === "openrouteservice" or $val === "openstreetmap" or $val === "layers" or $val === "satellite" or $val === "full" or $val === "openinfo" or $val === "scale") {
                $this->para[$val] = true;
            } elseif(".kml" === ($tmp = strtolower(substr($val,-4)))
                    or ".gpx" === ($tmp = strtolower(substr($val,-4)))
                    or ".icon" === ($tmp = ".".$key)) {
                global $CatPage;
                list($cat,$file) = $CatPage->split_CatPage_fromSyntax($val,true);
                if($CatPage->exists_File($cat,$file)) {
                    $this->para[substr($tmp,1)] = $CatPage->get_srcFile($cat,$file);
                    if(".icon" === $tmp and $this->para["iconsize"] === false
                            and false !== ($size = getimagesize($CatPage->get_pfadFile($cat,$file)))) {
                        $this->para["iconsize"] = true;
                        $this->para["sizeW"] = $size[0];
                        $this->para["sizeH"] = $size[1];

                    }
                } elseif(".icon" === $tmp and preg_match('/^http(s)?:\/\//',$val))
                    $this->para[substr($tmp,1)] = $val;
            } elseif($key === "iconsize" and 1 === preg_match('/^(\d+)(\s*[x]\s*(\d+))?$/',$val,$tmp)) {
                $this->para[$key] = true;
                $this->para["sizeW"] = $tmp[1];
                $this->para["sizeH"] = (isset($tmp[3])) ? $tmp[3] : $tmp[1];
            }
        }
    }

    private function getLink($link) {
        return '<a href="'.$link.'" target="_blank">'.$this->para["linktext"].'</a>';
    }

    private function getScript($map,$la) {
        $script = false;
        if($this->para["kml"]) {
            $script = $this->getKML($map);
        } elseif($this->para["gpx"]) {
            $script = $this->getGPX($map);
        } elseif(!$this->para["linktext"] and $this->para["lat"] and $this->para["long"]) {
            $script = $this->getLatLong($map);
        }
        if($script) {
            global $syntax;
            $syntax->insert_in_head('<script type="text/javascript" src="'.$this->PLUGIN_SELF_URL.'leaflet.js"></script>');

            if($this->para["full"])
                $syntax->insert_in_head('<script type="text/javascript" src="'.$this->PLUGIN_SELF_URL.'Leaflet.fullscreen.min.js"></script>');

            if(!$this->useGoogle['sat'] and ($this->para["layers"] or $this->para["satellite"])) {
                $syntax->insert_in_head('<script type="text/javascript" src="'.$this->PLUGIN_SELF_URL.'esri-leaflet-basemaps.js"></script>');
            }
            if($this->useGoogle['road'] or ($this->useGoogle['sat'] and ($this->para["layers"] or $this->para["satellite"]))) {
                $syntax->insert_in_head('<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?v=3.exp&amp;signed_in=false&amp;language='.$la.'&amp;sensor=false"></script>');
                $syntax->insert_in_head('<script type="text/javascript" src="'.$this->PLUGIN_SELF_URL.'Google.min.js"></script>');
            }

            if($this->para["kml"])
                $syntax->insert_in_head('<script type="text/javascript" src="'.$this->PLUGIN_SELF_URL.'KML.min.js"></script>');

            if($this->para["gpx"])
                $syntax->insert_in_head('<script type="text/javascript" src="'.$this->PLUGIN_SELF_URL.'GPX.min.js"></script>');

            return '<div class="map_warp"><div id="map'.$map.'" class="map" style="height:'.$this->para["height"].';"></div><script type="text/javascript">/*<![CDATA[*/'.$script.'/*]]>*/</script></div>';
        }
        return NULL;
    }

    private function getTileLayer($map) {
        return (($this->useGoogle['road']) 
                ? 'var road'.$map.' = new L.Google("ROADMAP");' 
                : 'var road'.$map.' = new L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {attribution: \'&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap<\/a> contributors\'});')
            .(($this->para["layers"] or $this->para["satellite"]) 
                ? ($this->useGoogle['sat']) 
                    ? 'var sat'.$map.' = new L.Google("HYBRID");' 
                    : 'var sat'.$map.' = new L.layerGroup([L.esri.basemapLayer("Imagery"),L.esri.basemapLayer("ImageryTransportation",{minZoom:6}),L.esri.basemapLayer("ImageryLabels")]);'
                : '')
            .(($this->para["layers"]) ? 'map'.$map.'.addControl(new L.Control.Layers({"'.$this->langcms->getLanguageHtml("road").'":road'.$map.', "'.$this->langcms->getLanguageHtml("sat").'":sat'.$map.'}, {},{position: "bottomright"}));' : '')

            .(($this->para["full"]) ? 'L.control.fullscreen({position: "topright"}).addTo(map'.$map.');' : '')

            .(($this->para["scale"]) ? 'L.control.scale({imperial:false}).addTo(map'.$map.');' : '')

            .'map'.$map.'.addLayer('.(($this->para["satellite"]) ? 'sat'.$map : 'road'.$map).');';
    }

    private function getLatLong($map) {
        return 'var map'.$map.' = L.map("map'.$map.'").setView(['.$this->para["lat"].', '.$this->para["long"].'], '.$this->para["zoom"].');'
            .$this->getTileLayer($map)
            .'L.marker(['.$this->para["lat"].', '.$this->para["long"].']'.(($this->para["icon"]) ? ',{icon:L.icon({'.(($this->para["iconsize"]) ? 'iconSize:['.$this->para["sizeW"].','.$this->para["sizeH"].'],popupAnchor: [0,-'.($this->para["sizeH"] / 2).'],' : '').'iconUrl:"'.$this->para["icon"].'"})}' : '').').addTo(map'.$map.')'
            .($this->para["infotext"] 
                ? '.bindPopup("'.$this->para["infotext"].'")'
                    .(($this->para["openinfo"]) 
                        ? '.openPopup();' 
                        : '')
                : ';');
    }

    private function getKML($map) {
        return 'var map'.$map.' = L.map("map'.$map.'");'
            .$this->getTileLayer($map)
            .'var ext'.$map.' = new L.KML("'.$this->para["kml"].'", {async: true}).on("loaded", function(e) {map'.$map.'.fitBounds(e.target.getBounds()); '.(($this->para["openinfo"]) 
                ? 'ext'.$map.'.openPopup();'
                : '').'if(typeof map'.$map.'.options.maxZoom != "undefined"){if(map'.$map.'.getZoom() > map'.$map.'.options.maxZoom){map'.$map.'.setZoom(map'.$map.'.options.maxZoom);}}}).addTo(map'.$map.');';
    }

    private function getGPX($map) {
        return 'var map'.$map.' = L.map("map'.$map.'");'
            .$this->getTileLayer($map)
            .'var ext'.$map.' = new L.GPX("'.$this->para["gpx"].'", {async: true}).on("loaded", function(e) {map'.$map.'.fitBounds(e.target.getBounds());'.(($this->para["openinfo"]) 
                ? 'ext'.$map.'.openPopup();'
                : '').'if(typeof map'.$map.'.options.maxZoom != "undefined"){if(map'.$map.'.getZoom() > map'.$map.'.options.maxZoom){map'.$map.'.setZoom(map'.$map.'.options.maxZoom);}}}).addTo(map'.$map.');';
    }

    public function getConfig() {
        $config['usegooglesat'] = array(
            "type" => "checkbox",
            "description" => ''
        );
        $config['usegoogleroad'] = array(
            "type" => "checkbox",
            "description" => ''
        );
        $config['--template~~'] = $this->lang->getLanguageValue("info")
            .'<ul style="list-style-type:none;padding-left:1.2em;"><li style="padding-top:.5em;">{usegooglesat_checkbox} <label for="'.$this->pluginName.'-usegooglesat">'.$this->lang->getLanguageValue("sat").'</label></li>'
            .'<li style="padding-top:.5em;">{usegoogleroad_checkbox} <label for="'.$this->pluginName.'-usegoogleroad">'.$this->lang->getLanguageValue("road").'</label></li><ul>';
        return $config;

    }

    public function getInfo() {
        global $ADMIN_CONF;
        $info = "";
        if(file_exists($this->PLUGIN_SELF_DIR."lang/info_".$ADMIN_CONF->get("language").".html"))
            $info = file_get_contents($this->PLUGIN_SELF_DIR."lang/info_".$ADMIN_CONF->get("language").".html");
        elseif(file_exists($this->PLUGIN_SELF_DIR."lang/info_deDE.html"))
            $info = file_get_contents($this->PLUGIN_SELF_DIR."lang/info_deDE.html");

        $info = str_replace("{PLUGINNAME}",$this->pluginName,$info);

        $this->lang = new Language($this->PLUGIN_SELF_DIR."lang/conf_".$ADMIN_CONF->get("language").".txt");

        return array(
            // Plugin-Name
            "<b>".$this->pluginName."</b> ".$this->lang->getLanguageValue("revision","5"),
            // CMS-Version
            "2.0",
            // Kurzbeschreibung
            $info,
            // Name des Autors
            "stefanbe",
            // Download-URL
            "",
            array(
                '{'.$this->pluginName.'| KML oder GPX Datei oder lat=, long= ,satellite ,layers, full, scale}' => 'Karte',
                '{'.$this->pluginName.'| google=, linktext=, openrouteservice, openstreetmap, lat=, long= }' => 'Route Link')
        );
    }
}

?>