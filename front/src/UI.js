"use strict";

/*

The UI class renders the user interface

*/

var UI = function(){}

var NetworkHandler = require('./NetworkHandler');

UI.prototype.createUI = function() {
  // Create the base HTML
  document.querySelector(".content").innerHTML = `
        <h2>Pysäkit</h2>

        <ul class="stop-list"></ul>

        <br />

        <button class="driver-button">Pysäkiltä ei noussut ketään</button>`;
  // Add a listener to the driver button
  var driverButton = document.querySelector(".driver-button");
  driverButton.addEventListener("click", function() {
    NetworkHandler.postDriverButton();
  });
}

// Setup the header
UI.prototype.setupHeader = function(trip) {
  if (trip) {
    UI.prototype.logInfo(); // Selvitä miksei toimi thisillä
    var tripName = UI.prototype.parseHeadsign(trip);
    var busNumber = UI.prototype.parseBusNumber(trip);
    var startTime = UI.prototype.parseStartTime(trip);
    // Set the header
    document.querySelector("h2").innerHTML = tripName + " (" + busNumber + "), lähtö klo " + startTime;
  }
  return trip;
}

// Parse bus start time
UI.prototype.parseStartTime = function(trip) {
  var t = trip.start / 60;
  var hours = Math.floor(t / 60)
  if (hours < 10) {
    hours = "0" + hours;
  }
  var minutes = (t % 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  return hours + ":" + minutes
}

// Parse the bus number
UI.prototype.parseBusNumber = function(trip) {
  return parseInt(trip.line.split(":")[1].substring(1));
}

// Parse the bus's start and end locations and add them together
UI.prototype.parseHeadsign = function(trip) {
  var tripLeft = trip.route.longName.split(" - ")[0];
  var tripRight = trip.route.longName.split(" - ")[1];
  if (trip.tripHeadsign == tripLeft) {
    tripLeft = tripRight;
    tripRight = trip.tripHeadsign;
  }
  return tripLeft + " - " + tripRight;
}

// General logging
UI.prototype.logInfo = function() {
  debug("Bus tripId: " + currentTrip.gtfsId);
  debug("Bus direction: " + currentTrip.tripHeadsign);
  debug("Stops:")
  debug(currentTrip.stops);
}

// Create the stop elements
UI.prototype.renderStops = function(trip) {
  var stopList = document.querySelector(".stop-list");
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
  UI.prototype.updateStops();
}

// Update the stop element highlights
UI.prototype.updateStops = function() {
  // First hide the stops that are not supposed to be shown yet
  for (var s of currentTrip.stops) {
    UI.prototype.hideOrShowNode(s);
    // Remove unnecessary classes
    UI.prototype.cleanStops(s);
    // Highlight the next stop
    if (currentTrip.stopIndex == currentTrip.stops.indexOf(s)) {
      UI.prototype.highlightNextStop(s);
    }
    // Highlight the previous stop
    else if (currentTrip.stopIndex == currentTrip.stops.indexOf(s) + 1) {
      UI.prototype.highlightPreviousStop(s);
    }
  }
}

// Hide or show the stop
UI.prototype.hideOrShowNode = function(s) {
  if (currentTrip.stopIndex - 1 <= currentTrip.stops.indexOf(s) && currentTrip.stopIndex + VISIBLE_FUTURE_STOPS >= currentTrip.stops.indexOf(s)) {
    if (s.node.classList.contains("hidden")) {
      s.node.classList.remove("hidden");
    }
  } else {
    if (!s.node.classList.contains("hidden")) {
      s.node.classList.add("hidden");
    }
  }
}

// Highlight the next stop
UI.prototype.highlightNextStop = function(s) {
  for (var n of s.node.childNodes) {
    if (n.classList.contains("current-stop-marker")) {
      if (!n.classList.contains("current")) {
        n.classList.add("current");
        n.innerHTML = 'SEURAAVA';
        s.node.classList.add("current");
      }
    }
  }
}

// Highlight the previous stop
UI.prototype.highlightPreviousStop = function(s) {
  for (var n of s.node.childNodes) {
    if (n.classList.contains("current-stop-marker")) {
      if (!n.classList.contains("previous")) {
        n.classList.add("previous");
        n.innerHTML = 'EDELLINEN';
        s.node.classList.add("previous");
      }
    }
  }
}

// Clean the marker classes from the selected node
UI.prototype.cleanStops = function(s) {
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
  }
}

// Update the stop element counts
UI.prototype.updateCounts = function(payload) {
  for (var s of currentTrip.stops) {
    for (var p of payload) {
      if (s.gtfsId == p.id) {
        // Change the count
        var origCount = s.count;
        s.count = p.passengers;
        // If the count changed, play the highlight effect and add the correct classes
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
