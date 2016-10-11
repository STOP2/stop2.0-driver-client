"use strict";

var NetworkHandler = require('./NetworkHandler');
var UI = require('./UI');
var mqtt = require('mqtt');
var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");
var vehicleId = -1;

var stops = [];
var stopList;

function init() {
  vehicleId = document.getElementById('vehicle-name').value;
  mqttClient.on("message", function (topic, payload) {
    console.log([topic, payload].join(": "));
    UI.addStop(JSON.parse(payload));
  });
  UI.createUI();
  NetworkHandler.getCurrentVehicleData(vehicleId).then(UI.renderStops);
}

window.init = init;
window.STOP_API = "http://asd.asd"
window.RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
window.HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
window.mqttClient = mqttClient;
window.stopList = stopList;
window.stops = stops;
window.vehicleId = vehicleId;
