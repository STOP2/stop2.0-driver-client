"use strict";

const STOP_API = "http://asd.asd"
const RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
const HSL_API = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";

class NetworkHandler {

  static getHSLRealTimeAPIData(method, url) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.open(method, url, true);
      req.onload =  function() {
        if (req.status === 200 && req.responseText) {
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
  }

  static parseHSLRealTimeData(str) {
    if (!str || str === '{}') {
      throw new Error(" ");
    }
    var tmpobj = JSON.parse(str);
    try {
      tmpobj = tmpobj[Object.keys(tmpobj)[0]]["VP"];
    } catch (e) {
      throw new Error("invalid input data: ")
    }
    var d = new Date(tmpobj.tst);
    var strDate = d.getUTCFullYear();
    var m = d.getMonth() + 1;
    var dt = d.getUTCDate();
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
  }

  static getHSLTripData(tripData) {
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
          resolve(newTrip);
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
      req.send(queryStr);
    });
  }

  // static getCurrentBusPosition() {
  //   this.getHSLRealTimeAPIData()
  // }
  //
  // /* position -> stop id */
  // static getNextStop(position) {
  //
  // }

  static getCurrentVehicleData(vehicleName) {
    return this.getHSLRealTimeAPIData("GET", RT_API_URL + vehicleName + "/")
      .then(this.parseHSLRealTimeData)
      .then(this.getHSLTripData)
      .then(this.startListeningToMQTT);
  }

  static startListeningToMQTT(trip) {
    console.log('stoprequests/' + trip.gtfsId.replace("HSL:",""));
    mqttClient.subscribe('stoprequests/' + trip.gtfsId.replace("HSL:",""));
    return trip;
  }

  static postDriverButton() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", STOP_API + "/stoprequests", true);
    xhttp.send();
  }

}
