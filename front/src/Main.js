"use strict";

var UI = require('./UI');
var NwH = require('./NetworkHandler');
var Logger = require('./Logger');

// Global constants
if (typeof window !== 'undefined') {
  global = window;
}
global.STOP_API = "http://stop20.herokuapp.com";
global.RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
global.HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
global.VISIBLE_FUTURE_STOPS = 10;
global.DEBUG_MODE = true;
global.UPDATE_INTERVAL = 2000; // milliseconds

if (typeof window === 'undefined') {
  global.RUNNING_IN_NODE = true;
} else {
  global.RUNNING_IN_NODE = false;
}

console.log(global);
console.log(global.RUNNING_IN_NODE);

// Initialization
if (!RUNNING_IN_NODE) {
  UI.createInitialUI();
}

if (RUNNING_IN_NODE) {
  console.log("Node detected, running Node version.");
  NwH.getActiveTripsByRouteNum(process.argv[2]).then((trips) => {
    NwH.startListeningToMQTT(trip, null);
    setInterval(() => { NwH.getCurrentVehicleData.bind(NwH, trip) });
  });
}

Logger.init();

// Temp function to "move" to the next stop

//window.simulateNextStop = simulateNextStop;
