"use strict";

var UI = require('./UI');
var NwH = require('./NetworkHandler');
var Logger = require('./Logger');

// Global constants
window.STOP_API = "http://stop20.herokuapp.com";
window.RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
window.HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
window.VISIBLE_FUTURE_STOPS = 10;
window.DEBUG_MODE = true;
window.UPDATE_INTERVAL = 2000; // milliseconds
window.RUNNING_IN_NODE = typeof module !== 'undefined' && module.exports;

// Initialization
if (!RUNNING_IN_NODE) {
  UI.createInitialUI();
}

NwH.getActiveTripsByRouteNum(vehicleId).then((trips) => {
  if (!RUNNING_IN_NODE) {
    UI.updateBusList();
  } else {
    NwH.startListeningToMQTT(trip, null);
    window.setInterval(() => { NwH.getCurrentVehicleData.bind(NwH, trip)() };
  }
});

Logger.init();

// Temp function to "move" to the next stop

//window.simulateNextStop = simulateNextStop;
