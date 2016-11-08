"use strict";

/*

The UI class renders the user interface

*/

var UI = function(){};

var NwH = require('./NetworkHandler');

UI.prototype.createInitialUI = function() {
  document.querySelector(".content").innerHTML =
        `Reitin numero (esim. 55): <input type="text" id="route-number"></input> <button id="ok-button">OK</button>`;
  document.querySelector("#ok-button").addEventListener("click", UI.prototype.initBusList)
};

UI.prototype.initBusList = function() {
  var vehicleId = UI.prototype.hslExtToInt(document.getElementById('route-number').value);
  NwH.getActiveTripsByRouteNum(vehicleId).then((trips) => {
    var content = document.querySelector(".content").innerHTML = `
      <h2>Valitse lähtö</h2>
      <ul>
    `;
    for (var t of trips) {
      console.log(t);
      content = content + '<li><a class="bus-selection-button vehicle-' + t.veh + '">' + UI.prototype.parseHeadsign(t) + ' ' + UI.prototype.parseStartTime(t) + '</a></li>'
    }
    content = content + '</ul>'
    document.querySelector(".content").innerHTML = content;
    var busSelections = document.getElementsByClassName("bus-selection-button");
    for (var s of busSelections) {
      s.addEventListener("click", function() {
        UI.prototype.initMainView(s.classList[1].split("vehicle-")[1]);
      })
    }
  });
};

// Initialization function
UI.prototype.initMainView = function(vehicleId) {
  debug("*** STOP 2.0 - STARTING INITIALIZATION***");
  UI.prototype.createUI();
  NwH.init(vehicleId).then(UI.prototype.setupHeader).then(UI.prototype.renderStops);
  window.setInterval(() => { NwH.getCurrentVehicleData().then(UI.prototype.updateStops) }, window.UPDATE_INTERVAL);
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
    var tripName = UI.prototype.parseHeadsign(trip);
    var busNumber = UI.prototype.hslIntToExt(trip.line);
    var startTime = UI.prototype.parseStartTime(trip);
    // Set the header
    document.querySelector("h2").innerHTML = tripName + " (" + busNumber + "), lähtö klo " + startTime;
  }
  return trip;
};

// Parse bus start time
UI.prototype.parseStartTime = function(trip) {
  var t = trip.start / 60;
  var hours = Math.floor(t / 60);
  if (hours < 10) {
    hours = "0" + hours;
  }
  var minutes = (t % 60);
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  return hours + ":" + minutes
};


UI.prototype.hslIntToExt = function(intNum) {
  if (typeof intNum != 'string') {
    throw new TypeError("Incorrect argument type");
  }

  if (intNum === '1506') { // FIXME: this shouldn't exist
    return '506';
  } else if ((['2512K', '2550', '2550B', '2552', '2554', '2554K'].indexOf(intNum) >= 0)) {
    return intNum.replace('2','');
  } else if (['4415', '4415N', '4451', '4519', '4519A', '4520', '4560', '4611', '4611B', '4614',
      '4615', '4615T', '4615TK', '4615V', '4615VK', '4620', '4665', '4665A'].indexOf(intNum) >= 0) {
    return intNum.replace('4', '');
  } else if (['4061', '4061V'].indexOf(intNum) >= 0) {
    return intNum.replace('40', '');
  } else if (['1001', '1001A', '1002', '1002X', '1003', '1003X', '1004', '1004T', '1005',
      '1006', '1006T', '1006X', '1007A', '1007B', '1007X', '1008', '1009', '1009X'].indexOf(intNum) >= 0) {
    return intNum.replace('100', '');
  } else if (/^10[0-9][0-9][^0-9]*$/.exec(intNum)) {
    return intNum.replace('10', '');
  } else {
    throw new Error("Unknown argument");
  }
};

UI.prototype.hslExtToInt = function(extNum) {
  if (typeof extNum != 'string') {
    throw new TypeError("Incorrect argument type");
  }
  if (extNum === '506') { // FIXME: this shouldn't exist
    return '1' + extNum;
  } else  if (['512K', '550', '550B', '552', '554', '554K'].indexOf(extNum) >= 0) {
    return '2' + extNum;
  } else if (['415', '415N', '451', '519', '519A', '520', '560', '611', '611B', '614',
          '615', '615T', '615TK', '615V', '615VK', '620', '665', '665A'].indexOf(extNum) >= 0) {
    return '4' + extNum;
  } else if (['61', '61V'].indexOf(extNum) >= 0) {
    return '40' + extNum;
  } else if (['1', '1A', '2', '2X', '3', '3X', '4', '4T', '5',
      '6', '6T', '6X', '7A', '7B', '7X', '8', '9', '9X'].indexOf(extNum) >= 0) {
    return '100' + extNum;
  } else if (/^[0-9][0-9][^0-9]*$/.exec(extNum)) {
    return '10' + extNum;
  } else {
    throw new Error("Unknown argument");
  }
};

// Parse the bus's start and end locations and add them together
UI.prototype.parseHeadsign = function(trip) {
  var tripLeft = trip.route.longName.split(" - ")[0];
  var tripRight = trip.route.longName.split(" - ")[1];
  if (trip.tripHeadsign == tripLeft) {
    tripLeft = tripRight;
    tripRight = trip.tripHeadsign;
  }
  return tripLeft + " - " + tripRight;
};

// General logging
UI.prototype.logInfo = function(trip) {
  debug("Bus ID: " + trip.vehicle);
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
  debug("### coordinates: " + trip.lat + "," + trip.long);
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
