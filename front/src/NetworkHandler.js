"use strict";

/*

NetworkHandler handles all connections to HSL APIs and the backend.

*/

var NetworkHandler = function(){};
var _Logger = require('./Logger');
_Logger.init();
var Trip = require('./Trip');
//var UI = require('./UI');
var Mqtt = require('mqtt');


NetworkHandler.prototype.getCurrentVehicleData = function (trip) {
  return NetworkHandler.prototype.getHSLRealTimeAPIData(trip.veh)
    .then(this.parseHSLRealTimeData)
    .then(function (obj) {
      trip.updatePosition([obj.long, obj.lat], obj.nextStopID !== 'undefined'? "HSL:" + obj.nextStopID: obj.nextStopID);
      return trip;
    })
};

NetworkHandler.prototype.getHSLRealTimeAPIData = function(vehicleID) {
  var url = RT_API_URL + (vehicleID? vehicleID + '/': '');
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload =  function() {
      if (req.status === 200 && req.responseText) {
        if (req.responseText === '{}') {
          //throw new Error("No data from real time API");
          reject(Error("No data from real time API"));
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

  for (var i = 0; i < arr.length; i++) {
    result.push(NetworkHandler.prototype.getHSLTripData(arr[i]));
  }
  return Promise.all(result);
}

/**
 *
 * @param filterTest
 * @param str
 * @returns {Array} - of Trip instances
 */
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
      var sID = key.split('/')[9]; // ID of next stop
      // FIXME: check date
      if (! o.dir || ! o.start) { // .dir, .start and .line are used later
        continue;
      }
      o.nextStopID = sID === 'undefined'? sID: 'HSL:' + sID;
      o.dir--;
      var t = new Trip(o);
      a.push(t);
    }
  }
  return a;
}


NetworkHandler.prototype.parseHSLRealTimeData = function(str) {
  var stopID;
  var tmpobj = JSON.parse(str);
  try {
    stopID = Object.keys(tmpobj)[0].split('/')[9];
    tmpobj = tmpobj[Object.keys(tmpobj)[0]]["VP"];
  } catch (e) {
    throw new Error("Invalid input data: ")
  }
  tmpobj.nextStopID = stopID;
  return tmpobj;
};


NetworkHandler.prototype.getHSLTripData = function(trip) {
  var queryStr = `{
      fuzzyTrip(route: "HSL:${trip.line}", direction: ${trip.dir}, date: "${trip.getDate()}", time: ${trip.startTimeInSecs()})
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
        trip.copyProps(newTrip);
        resolve(trip);
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

NetworkHandler.prototype.startListeningToMQTT = function(trip, func) {
  debug("Subscribing to mqtt channel");
  var mqttClient = Mqtt.connect("ws://epsilon.fixme.fi:9001");
  // Subscribe to the trip's MQTT channel
  mqttClient.subscribe('stoprequests/' + trip.gtfsId);
  // React to MQTT messages
  mqttClient.on("message", function (topic, payload) {
    debug("MQTT: '" + [topic, payload].join(": ") + "'");
    //UI.updateCounts(JSON.parse(payload).stop_ids, trip);
    if (func != null) {
      func(JSON.parse(payload).stop_ids, trip);
    }
  });
  //debug('Connected to MQTT channel "stoprequests/' + trip.gtfsId);
  return trip;
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
