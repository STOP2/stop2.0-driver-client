"use strict";

/*

NetworkHandler handles all connections to HSL APIs and the backend.

*/

var NetworkHandler = function(){};
var _Logger = require('./Logger');
_Logger.init();
var Geom = require('./Geometry');

var currentTrip;
var vehicleID;

NetworkHandler.prototype.init = function(str) {
  vehicleID = str;
  return this.getHSLRealTimeAPIData("GET", RT_API_URL + vehicleID + "/")
    .then(this.parseHSLRealTimeData)
    .then(this.getHSLTripData)
    .then(this.startListeningToMQTT)
    .then(this.updatePosition)
    .then(this.setCurrentTrip);
};

NetworkHandler.prototype.updatePosition = function(trip) {
  trip.routeIndex = Geom.positionOnRoute(trip, [trip.long, trip.lat]);
  trip.stopIndex = Geom.nextStopIndex(trip);
  return trip;
};

NetworkHandler.prototype.getCurrentVehicleData = function () {
  return NetworkHandler.prototype.getHSLRealTimeAPIData("GET", RT_API_URL + vehicleID + "/")
    .then(this.extractPosition)
    .catch(function() {return [currentTrip.long, currentTrip.lat]})
    .then(function (coords) {
      currentTrip.long = coords[0];
      currentTrip.lat = coords[1];
      return currentTrip;
    }).then(this.updatePosition)
};

/**
 *
 * @param str
 * @returns {*}
 */
NetworkHandler.prototype.extractPosition = function(str) {
  var ret = NetworkHandler.prototype.parseHSLRealTimeData(str);
  return [ret.long, ret.lat]
};

NetworkHandler.prototype.setCurrentTrip = function(trip) {
  currentTrip = trip;
  return trip;
};

NetworkHandler.prototype.getCurrentTrip = function() {
  return currentTrip;
};

NetworkHandler.prototype.getHSLRealTimeAPIData = function(method, url) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open(method, url, true);
    req.onload =  function() {
      if (req.status === 200 && req.responseText) {
        if (req.responseText === '{}') {
          throw new Error("Error in HSL API: No data returned.");
        }
        debug("Data loaded from HSL API.");
        debug(JSON.parse(req.responseText));
        // If successful, resolve the promise by passing back the request response
        resolve(req.responseText);
      } else {
        // If it fails, reject the promise with a error message
        reject(Error('Connection to HSL real time API failed; error code:' + req.statusText));
      }
    };
    req.onerror = function() {
      // Also deal with the case when the entire request fails to begin with
      // This is probably a network error, so reject the promise with an appropriate message
      reject(Error('There was a network error.'));
    };
    req.send();
  });
};

NetworkHandler.prototype.parseHSLRealTimeData = function(str) {
  var tmpobj = JSON.parse(str);
  try {
    tmpobj = tmpobj[Object.keys(tmpobj)[0]]["VP"];
  } catch (e) {
    throw new Error("invalid input data: ")
  }
  if (tmpobj.lat === 0 || tmpobj.long === 0) {
    throw new Error("No location data");
  }
  var d = new Date(tmpobj.tst);
  var strDate = d.getFullYear();
  var m = d.getMonth() + 1;
  var dt = d.getDate();
  strDate += m < 10? "0" + m: "" + m;
  strDate += dt < 10? "0" + dt: "" + dt;
  return {
    vehicle: tmpobj.veh,
    line: "HSL:" + tmpobj.line,
    lat: tmpobj.lat,
    long: tmpobj.long,
    direction: tmpobj.dir - 1,
    start: ((Math.floor(Number.parseInt(tmpobj.start, 10) / 100) * 60) + Number.parseInt(tmpobj.start, 10) % 100) * 60,
    timeStr: tmpobj.tst,
    date: strDate
  }
};

NetworkHandler.prototype.getHSLTripData = function(tripData) {
  var queryStr = `{
      fuzzyTrip(route: "${tripData.line}", direction: ${tripData.direction}, date: "${tripData.date}", time: ${tripData.start})
        {
          gtfsId
          tripHeadsign
          stops
          {
            code
            gtfsId
            name
            lat
            lon
          }
          route
          {
            longName
          }
          geometry
        }
    }`;
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open("POST", HSL_API, true);
    req.setRequestHeader("Content-type", "application/graphql");
    req.onload =  function() {
      if (req.status === 200 && req.responseText) {
        // If successful, resolve the promise by passing back the request response
        var newTrip = JSON.parse(req.responseText).data.fuzzyTrip;
        for (var prop in tripData) {
          if (tripData.hasOwnProperty(prop)) {
            newTrip[prop] = tripData[prop];
          }
        }
        debug("Trip loaded from HSL API.");
        debug(newTrip);
        resolve(newTrip);
      } else {
        // If it fails, reject the promise with a error message
        reject(Error('Connection to HSL API failed; error code: ' + req.statusText));
      }
    };
    req.onerror = function() {
      // Also deal with the case when the entire request fails to begin with
      // This is probably a network error, so reject the promise with an appropriate message
      reject(Error('There was a network error.'));
    };
    req.send(queryStr);
  });
};

NetworkHandler.prototype.startListeningToMQTT = function(trip) {
  var mqttClient = require('mqtt').connect("ws://epsilon.fixme.fi:9001");
  // Subscribe to the trip's MQTT channel
  mqttClient.subscribe('stoprequests/' + trip.gtfsId);
  // React to MQTT messages
  mqttClient.on("message", function (topic, payload) {
    debug("MQTT: '" + [topic, payload].join(": ") + "'");
    require('./UI').updateCounts(JSON.parse(payload).stop_ids, trip);
  });
  debug('Connected to MQTT channel "stoprequests/' + trip.gtfsId);
  return trip;
};

NetworkHandler.prototype.getNextStop = function(trip) {
  if (!trip.hasOwnProperty("stopIndex")) {
    trip.stopIndex = 0;
  }
  // Increment the stop index by 1 and return the corresponding stop
  var stop = trip.stopIndex >= trip.stops.length? null: trip.stops[trip.stopIndex++];
  debug("Moving to next stop. Stop:");
  debug(stop);
  return stop;
};

NetworkHandler.prototype.postDriverButton = function() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", STOP_API + "/stoprequests/report", true);
  // Send the last stop's id and the trip's id to backend
  var msg = '{"trip_id": "' + currentTrip.gtfsId + '", "stop_id": "' + currentTrip.stops[currentTrip.stopIndex-1].gtfsId + '"}';
  xhttp.send(msg);
  debug("Sent message to backend: " + msg);
};

module.exports = new NetworkHandler();
