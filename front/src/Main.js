"use strict";

var UI = require('./UI');
var Logger = require('./Logger');

// Global constants
window.STOP_API = "http://stop20.herokuapp.com"
window.RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
window.HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
window.VISIBLE_FUTURE_STOPS = 4;
window.DEBUG_MODE = true;

// Initialization
UI.createInitialUI();
Logger.init();

// Temp function to "move" to the next stop
function simulateNextStop() {
  var nh = require('./NetworkHandler');
  nh.getNextStop(nh.getCurrentTrip());
  UI.updateStops(nh.getCurrentTrip());
}
window.simulateNextStop = simulateNextStop;
