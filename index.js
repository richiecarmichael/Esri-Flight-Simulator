/* -----------------------------------------------------------------------------------
   Developed by the Applications Prototype Lab
   (c) 2015 Esri | http://www.esri.com/legal/software-license  
----------------------------------------------------------------------------------- */

require([
    'esri/Map',
    'esri/Camera',
    'esri/views/MapView',
    'esri/views/SceneView',
    'esri/Viewpoint',
    'esri/geometry/Point',
    'esri/geometry/support/webMercatorUtils',
    'dojo/domReady!'
],
function (
    Map,
    Camera,
    MapView,
    SceneView,
    Viewpoint,
    Point,
    webMercatorUtils
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        // Plane flight details
        var lastTime = null;
        var speed = 200; // m/s
        var heading = 0;
        var location = new Point({
            x: 779232,
            y: 5780430,
            z: 3000,
            spatialReference: {
                wkid: 102100
            }
        });

        // Initialize maps and views
        var map = new Map({
            basemap: 'satellite'
        });
        var viewMain = new MapView({
            container: 'map',
            map: map,
            zoom: 12,
            rotation: 0,
            center: location
        });
        var viewForward = new SceneView({
            container: 'forward-map',
            map: map,
            camera: {
                heading: 0,
                position: location,
                tilt: 85
            }
        });
        var viewLeft = new SceneView({
            container: 'left-map',
            map: map,
            camera: {
                heading: 270,
                position: location,
                tilt: 80
            }
        });
        var viewRight = new SceneView({
            container: 'right-map',
            map: map,
            camera: {
                heading: 90,
                position: location,
                tilt: 80
            }
        });

        viewMain.ui.components = ['compass', 'zoom'];
        viewForward.ui.components = [];
        viewLeft.ui.components = [];
        viewRight.ui.components = [];

        window.requestAnimationFrame(draw);

        function draw(time) {
            if (map.loaded && lastTime !== null) {
                //var h = viewMain.rotation;
                var t = time - lastTime; // ms
                var d = speed * t / 1000;
                var v = Vector.create([location.x, location.y]);
                var x = Vector.create([0, d]).rotate(-heading * Math.PI / 180, Vector.create([0, 0]));
                var z = v.add(x);

                //
                location.x = z.e(1);
                location.y = z.e(2);
                location.z = location.z;

                viewMain.center = location;
                viewMain.rotation = -heading;
                viewForward.camera = new Camera({
                    heading: heading,
                    position: location,
                    tilt: 85
                });
                viewLeft.camera = new Camera({
                    heading: heading - 90,
                    position: location,
                    tilt: 80
                });
                viewRight.camera = new Camera({
                    heading: heading + 90,
                    position: location,
                    tilt: 80
                });

                var geographic = webMercatorUtils.webMercatorToGeographic(location);

                $('#dial-speed').html(format.format(',')(speed) + ' m/s');
                $('#dial-altitude').html(format.format(',')(location.z) + ' m');
                $('#dial-heading').html(format.format(',')(heading) + '°');
                $('#dial-location-x').html(ConvertDDToDMS(geographic.x, true));
                $('#dial-location-y').html(ConvertDDToDMS(geographic.y, false));
            }
            lastTime = time;
            requestAnimationFrame(draw);
        }

        $('#button-speed-up').click(function () {
            speed += 100;
        });
        $('#button-speed-dn').click(function () {
            speed -= 100;
            if (speed < 0) {
                speed = 0;
            }
        });
        $('#button-altitude-up').click(function () {
            location.z += 100;
        });
        $('#button-altitude-dn').click(function () {
            location.z -= 100;
            if (location.z < 0) {
                location.z = 0;
            }
        });
        $('#button-heading-up').click(function () {
            heading += 10;
            if (heading > 360) {
                heading -= 360;
            }
        });
        $('#button-heading-dn').click(function () {
            heading -= 10;
            if (heading < 0) {
                heading += 360;
            }
        });

        function ConvertDDToDMS(d, lng) {
            var dir = d < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N';
            var deg = 0 | (d < 0 ? d = -d : d);
            var min = 0 | d % 1 * 60;
            var sec = (0 | d * 60 % 1 * 60);
            return deg + '° ' + format.format('02d')(min) + '\' ' + format.format('02d')(sec) + '" ' + dir;
        }

        String.prototype.format = function () {
            var s = this;
            var i = arguments.length;
            while (i--) {
                s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
            }
            return s;
        };
    });
});

// --------------------------------------------------------------------------------------------
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// RequestAnimationFrame polyfill by Erik Möller
// Fixes from Paul Irish and Tino Zijdel
// --------------------------------------------------------------------------------------------
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());
