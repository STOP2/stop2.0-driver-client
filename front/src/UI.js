"use strict";

/*

The UI class renders the user interface

*/

var UI = function(){};

var Trip = require('./Trip');
var NwH = require('./NetworkHandler');

UI.prototype.createInitialUI = function() {
  document.querySelector(".content").innerHTML =
        `Reitin numero (esim. 55): <input type="text" id="route-number"></input> <button id="ok-button">OK</button>`;
  document.querySelector("#ok-button").addEventListener("click", UI.prototype.initBusList)
};

UI.prototype.initBusList = function() {
  var vehicleId = Trip.hslExtToInt(document.getElementById('route-number').value);
  NwH.getActiveTripsByRouteNum(vehicleId).then((trips) => {
    var content = document.querySelector(".content").innerHTML = "<h2>Valitse lähtö</h2>";
    var ul = document.createElement('ul');
    for (var t of trips) {
      var li = document.createElement('li');
      var sp = document.createElement('span');
      sp.setAttribute('class', 'bus-selection-button vehicle-' + t.veh);
      sp.textContent = t.tripHeadsign + ' ' + t.startTimeAsString();
      sp.addEventListener('click', UI.prototype.initMainView.bind(this, t));
      li.appendChild(sp);
      ul.appendChild(li);
    }
    document.querySelector(".content").appendChild(ul);
  });
};

// Initialization function
UI.prototype.initMainView = function(trip) {
  debug("*** STOP 2.0 - STARTING INITIALIZATION***");
  UI.prototype.createUI();
  NwH.startListeningToMQTT(trip, UI.prototype.updateCounts);
  UI.prototype.setupHeader(trip);
  UI.prototype.renderStops(trip);
  window.setInterval(() => { NwH.getCurrentVehicleData.bind(NwH, trip)().then(UI.prototype.updateStops) }, window.UPDATE_INTERVAL);
};

UI.prototype.createUI = function() {
  // Create the base HTML
  document.querySelector(".content").innerHTML = `
        <h2>Pysäkit</h2>
        <ul class="stop-list"></ul>
        <br />
        <button class="driver-button">Pysäkiltä ei noussut ketään</button>`;
  // Add a listener to the driver button
  document.querySelector(".driver-button").addEventListener("click", function() {
    NwH.postDriverButton();
  });
};

// Setup the header
UI.prototype.setupHeader = function(trip) {
  if (trip) {
    UI.prototype.logInfo(trip); // Selvitä miksei toimi thisillä
    debug(trip);
    trip.initPosition();
    // Set the header
    document.querySelector("h2").innerHTML = trip.getLongName() +
      " (" + trip.routeNumber() + "), lähtö klo " + trip.startTimeAsString();
  }
};

// General logging
UI.prototype.logInfo = function(trip) {
  debug("Bus ID: " + trip.veh);
  debug("Bus tripId: " + trip.gtfsId);
  debug("Bus direction: " + trip.tripHeadsign);
  debug("Stops:");
  debug(trip.stops);
};

// Create the stop elements
UI.prototype.renderStops = function(trip) {
  var stopList = document.querySelector(".stop-list");
  for (var s of trip.stops) {
    s.count = 0;
    var item = document.createElement("li");
    item.classList.add("stop-" + s.gtfsId);
    item.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number'>" + s.count + "</span></span>";
    stopList.appendChild(item);
    s.node = item;
  }
  debug("*** STOP 2.0 - FINISHED INITIALIZING ***")
  UI.prototype.updateStops(trip);
};

// Update the stop element highlights
UI.prototype.updateStops = function(trip) {
  debug("### coordinates: " + trip.lat + "," + trip.long + ", next stop: " + trip.nextStopID);
  UI.prototype.resetIfLastStop(trip);
  // First hide the stops that are not supposed to be shown yet
  for (var s of trip.stops) {
    UI.prototype.hideOrShowNode(s, trip);
    // Remove unnecessary classes
    UI.prototype.cleanStops(s);
    // Highlight the next stop
    if (trip.stopIndex == trip.stops.indexOf(s)) {
      UI.prototype.highlightNextStop(s);
    }
    // Highlight the previous stop
    else if (trip.stopIndex == trip.stops.indexOf(s) + 1) {
      UI.prototype.highlightPreviousStop(s);
    }
  }
};

UI.prototype.resetIfLastStop = function (trip) {
  if (trip.stopIndex == trip.stops.length - 1) {
    window.location.reload();
  }
};

// Hide or show the stop
UI.prototype.hideOrShowNode = function(s, trip) {
  if (trip.stopIndex - 1 <= trip.stops.indexOf(s) && trip.stopIndex + VISIBLE_FUTURE_STOPS >= trip.stops.indexOf(s)) {
    if (s.node.classList.contains("hidden")) {
      s.node.classList.remove("hidden");
    }
  } else {
    if (!s.node.classList.contains("hidden")) {
      s.node.classList.add("hidden");
    }
  }
};

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
};

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
};

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
};

// Update the stop element counts
UI.prototype.updateCounts = function(payload, trip) {
  for (var s of trip.stops) {
    for (var p of payload) {
      if (s.gtfsId == p.id) {
        // Change the count
        var origCount = s.count;
        s.count = p.passengers;
        // If the count changed, play the highlight effect and add the correct classes
        if (origCount != s.count) {
          if (s.count != 0) {
            s.node.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number active'>" + s.count + "</span></span>";
          } else {
            s.node.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number'>" + s.count + "</span></span>";
          }
        }
      }
    }
  }
};

module.exports = new UI();
