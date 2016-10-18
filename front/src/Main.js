"use strict";

var NetworkHandler = require('./NetworkHandler');
var UI = require('./UI');
var mqtt = require('mqtt');
var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");
var vehicleId = -1;

function init() {
  debug("*** STOP 2.0 - STARTING INITIALIZATION***")
  vehicleId = document.getElementById('vehicle-name').value;
  mqttClient.on("message", function (topic, payload) {
    debug("MQTT: '" + [topic, payload].join(": ") + "'");
    var stops = JSON.parse(payload).stop_ids;
    UI.updateStops(stops);
  });
  UI.createUI();
  NetworkHandler.getCurrentVehicleData(vehicleId).then(UI.renderUI);
}

function simulateNextStop() {
  NetworkHandler.getNextStop(currentTrip);
  UI.updateStops([]);
}

window.init = init;
window.simulateNextStop = simulateNextStop;
window.mqttClient = mqttClient;
window.currentTrip;
window.STOP_API = "http://stop20.herokuapp.com"
window.RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
window.HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
window.VISIBLE_FUTURE_STOPS = 4;
window.DEBUG_MODE = true;
if (DEBUG_MODE) {
  window.debug = console.log.bind(window.console);
  debug.warn = console.warn.bind(window.console);
  debug.error = console.error.bind(window.console);
}
else window.debug = function(){}
