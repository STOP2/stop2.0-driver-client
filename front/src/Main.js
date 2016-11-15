"use strict";

var UI = require('./UI');
var NwH = require('./NetworkHandler');
var Logger = require('./Logger');
var Trip = require('./Trip');

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

// Initialization

Logger.init();

if (!global.RUNNING_IN_NODE) {
  UI.createInitialUI();
}

if (global.RUNNING_IN_NODE) {
  console.log("Node detected, running Node version.");
  NwH.getActiveTripsByRouteNum(Trip.hslExtToInt(process.argv[2])).then((trips) => {
    console.log("Promise resolved");
    NwH.startListeningToMQTT(trip, null);
    setInterval(() => { NwH.getCurrentVehicleData.bind(NwH, trip)() });
  });
}

// Temp function to "move" to the next stop

//window.simulateNextStop = simulateNextStop;
