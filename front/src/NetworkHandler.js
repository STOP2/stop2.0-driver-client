"use strict";

/*

NetworkHandler handles all connections to HSL APIs and the backend.

*/

var NetworkHandler = function(){};
var _Logger = require('./Logger');
_Logger.init();
var Geom = require('./Geometry');
var UI = require('./UI');
var Mqtt = require('mqtt');

var currentTrip;
var vehicleID;

NetworkHandler.prototype.init = function(str) {
  vehicleID = str;
  return this.getHSLRealTimeAPIData(vehicleID)
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
  return NetworkHandler.prototype.getHSLRealTimeAPIData(vehicleID)
    .then(this.extractPosition)
    .catch(function() {return [currentTrip.long, currentTrip.lat]})
    .then(function (coords) {
      currentTrip.long = coords[0];
      currentTrip.lat = coords[1];
      return currentTrip;
    }).then(this.updatePosition)
};

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

NetworkHandler.prototype.getHSLRealTimeAPIData = function(vehicleID) {
  var url = RT_API_URL + (vehicleID? vehicleID + '/': '');
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload =  function() {
      if (req.status === 200 && req.responseText) {
        if (req.responseText === '{}') {
          throw new Error("No data from real time API");
        }
        //debug("Real time data loaded from HSL API.");
        //debug(JSON.parse(req.responseText));
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

NetworkHandler.prototype.getActiveTripsByRouteNum = function(route) {
  var testfunc = function(route) {
    return function (key) {
      return (key.split('/')[5] === route);
    }
  }(route);

  var a = NetworkHandler.prototype.getHSLRealTimeAPIData('')
    .then(parseData.bind(null, testfunc))
    .then(getAll);
  //console.log(a);
  return a;
};

function getAll(arr) {
  var result = [];

  //console.log(arr);
  for (var i = 0; i < arr.length; i++) {
    //console.log(arr[i]);
    result.push(NetworkHandler.prototype.getHSLTripData(arr[i]));
  }
  return Promise.all(result);
}

function parseData(filterTest, str) {
  var a = [];
  var tmp = JSON.parse(str);
  var o;

  if (Object.getOwnPropertyNames(tmp).length === 0) { // Empty object
    throw new Error("No real time data");
  }

  for (var key in tmp) {
    if (filterTest(key)) {
      try {
        o = tmp[key]["VP"];
      } catch (e) {
        throw new Error("Invalid real time data");
      }
      if (o.lat === 0 || o.long === 0) {
        throw new Error("No location in real time data for vehicle " + tmp.veh);
      }
      o.start = timeInSeconds(o.start);
      o.date = mungeDate(o.tst);
      o.dir--;
      a.push(o);
    }
  }
  return a;
}


NetworkHandler.prototype.parseHSLRealTimeData = function(str) {
  var tmpobj = JSON.parse(str);
  try {
    tmpobj = tmpobj[Object.keys(tmpobj)[0]]["VP"];
  } catch (e) {
    throw new Error("Invalid input data: ")
  }
  if (tmpobj.lat === 0 || tmpobj.long === 0) {
    throw new Error("No location data");
  }

  return {
    vehicle: tmpobj.veh,
    line: tmpobj.line,
    lat: tmpobj.lat,
    long: tmpobj.long,
    dir: tmpobj.dir - 1,
    start: timeInSeconds(tmpobj.start),
    timeStr: tmpobj.tst,
    date: mungeDate(tmpobj.tst)
  }
};

function timeInSeconds(num) {
  return ((Math.floor(Number.parseInt(num, 10) / 100) * 60) + Number.parseInt(num, 10) % 100) * 60;
}

function mungeDate(str) {
  var d = new Date(str);
  var strDate = d.getFullYear();
  var m = d.getMonth() + 1;
  var dt = d.getDate();
  strDate += m < 10? "0" + m: "" + m;
  strDate += dt < 10? "0" + dt: "" + dt;
  return strDate;
}

NetworkHandler.prototype.getHSLTripData = function(tripData) {
  //debug(tripData);
  var queryStr = `{
      fuzzyTrip(route: "HSL:${tripData.line}", direction: ${tripData.dir}, date: "${tripData.date}", time: ${tripData.start})
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
        if (newTrip === null) {
          reject(Error("Received no data for current trip"));
        }
        for (var prop in tripData) {
          if (tripData.hasOwnProperty(prop)) {
            newTrip[prop] = tripData[prop];
          }
        }
        //debug("Trip loaded from HSL API.");
        //debug(newTrip);
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
  var mqttClient = Mqtt.connect("ws://epsilon.fixme.fi:9001");
  // Subscribe to the trip's MQTT channel
  mqttClient.subscribe('stoprequests/' + trip.gtfsId);
  // React to MQTT messages
  mqttClient.on("message", function (topic, payload) {
    debug("MQTT: '" + [topic, payload].join(": ") + "'");
    UI.updateCounts(JSON.parse(payload).stop_ids, trip);
  });
  //debug('Connected to MQTT channel "stoprequests/' + trip.gtfsId);
  return trip;
};

NetworkHandler.prototype.getNextStop = function(trip) {
  if (!trip.hasOwnProperty("stopIndex")) {
    trip.stopIndex = 0;
  }
  // Increment the stop index by 1 and return the corresponding stop
  var stop = trip.stopIndex >= trip.stops.length? null: trip.stops[trip.stopIndex++];
  //debug("Moving to next stop. Stop:");
  //debug(stop);
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
