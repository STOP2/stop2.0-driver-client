"use strict";

const RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
const BUS_ID = 1209;
const STOP_API = "http://test";
const HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

var currentRoute = "";
var currentStop;

var tripData;

var driverButton;
var stopList;
var stops = [];

class Main {
    static init() {
      mqttClient.on("message", function (topic, payload) {
        console.log([topic, payload].join(": "));
        UI.addStop(JSON.parse(payload));
      });
      NetworkHandler.getCurrentVehicleData();
      UI.createUI();
    }
}
