"use strict";

var UI = function(){}
var stopList;

var NetworkHandler = require('./NetworkHandler');

UI.prototype.createUI = function() {
  document.querySelector(".content").innerHTML = `
        <h2>Pysäkit</h2>

        <ul class="stop-list"></ul>

        <br />

        <button class="driver-button">Pysäkiltä ei noussut ketään</button>`;
  var driverButton = document.querySelector(".driver-button");
  driverButton.addEventListener("click", function() {
    NetworkHandler.postDriverButton();
  });
  stopList = document.querySelector(".stop-list");
}

UI.prototype.renderUI = function(trip) {
  window.currentTrip = trip;
  if (trip) {
    var t = trip.start / 60;
    var hours = Math.floor(t / 60)
    if (hours < 10) {
      hours = "0" + hours;
    }
    var minutes = (t % 60);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    UI.prototype.logInfo();
    var tripName = UI.prototype.parseHeadsign(trip);
    var busNumber = UI.prototype.parseBusNumber(trip);
    document.querySelector("h2").innerHTML = tripName + " (" + busNumber + "), lähtö klo " + hours + ":" + minutes;
    UI.prototype.renderStops(trip); //TODO: Selvitä miksi tämä ei toimi thisillä
  }
}

UI.prototype.parseBusNumber = function(trip) {
  return parseInt(trip.line.split(":")[1].substring(1));
}

UI.prototype.parseHeadsign = function(trip) {
  var tripLeft = trip.route.longName.split(" - ")[0];
  var tripRight = trip.route.longName.split(" - ")[1];
  if (trip.tripHeadsign == tripLeft) {
    tripLeft = tripRight;
    tripRight = trip.tripHeadsign;
  }
  return tripLeft + " - " + tripRight;
}

UI.prototype.logInfo = function() {
  debug("Bus tripId: " + currentTrip.gtfsId);
  debug("Bus direction: " + currentTrip.tripHeadsign);
  debug("Stops:")
  debug(currentTrip.stops);
}

UI.prototype.renderStops = function(trip) {
  for (var s of trip.stops) {
    s.count = 0;
    var item = document.createElement("li");
    item.classList.add("stop-" + s.code);
    item.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number'>" + s.count + "</span></span>";
    stopList.appendChild(item);
    s.node = item;
  }
  debug("*** STOP 2.0 - FINISHED INITIALIZING ***")
  NetworkHandler.getNextStop(currentTrip);
  UI.prototype.updateStops([]);
}

UI.prototype.updateStops = function(payload) {
  for (var s of currentTrip.stops) {
    if (currentTrip.stopIndex - 1 <= currentTrip.stops.indexOf(s) && currentTrip.stopIndex + VISIBLE_FUTURE_STOPS >= currentTrip.stops.indexOf(s)) {
      if (s.node.classList.contains("hidden")) {
        s.node.classList.remove("hidden");
      }
    } else {
      if (!s.node.classList.contains("hidden")) {
        s.node.classList.add("hidden");
      }
    }
    if (currentTrip.stopIndex == currentTrip.stops.indexOf(s)) {
      for (var n of s.node.childNodes) {
        if (n.classList.contains("current-stop-marker")) {
          if (!n.classList.contains("current")) {
            n.classList.add("current");
            n.innerHTML = 'SEURAAVA';
            s.node.classList.add("current");
          }
        }
      }
    } else {
      for (var n of s.node.childNodes) {
        if (n.classList.contains("current-stop-marker")) {
          if (n.classList.contains("current")) {
            n.classList.remove("current");
            n.innerHTML = '';
            s.node.classList.remove("current");
          }
          if (n.classList.contains("previous")) {
            n.classList.remove("previous");
            n.innerHTML = '';
            s.node.classList.remove("previous");
          }
        }
        if (currentTrip.stopIndex == currentTrip.stops.indexOf(s) + 1) {
          if (n.classList.contains("current-stop-marker")) {
            if (!n.classList.contains("previous")) {
              n.classList.add("previous");
              n.innerHTML = 'EDELLINEN';
              s.node.classList.add("previous");
            }
          }
        }
      }
    }
  }
  for (var s of currentTrip.stops) {
    for (var p of payload) {
      if (s.gtfsId == p.id) {
        var origCount = s.count;
        s.count = p.passengers;
        if (origCount != s.count) {
          s.node.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number'>" + s.count + "</span></span>";
          for (var n of s.node.childNodes) {
            if (n.classList.contains("number")) {
              if (s.count != 0) {
                if (!n.classList.contains("active")) {
                  n.classList.add("active");
                }
              } else {
                if (n.classList.contains("active")) {
                  n.classList.remove("active");
                }
              }
              break;
            }
          }
        }
        return;
      }
    }
  }
}

module.exports = new UI();
