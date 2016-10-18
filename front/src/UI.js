"use strict";

var UI = function(){}
var stops = [];
var stopList;

var NetworkHandler = require('./NetworkHandler');

UI.prototype.createUI = function() {
  document.querySelector(".content").innerHTML = `
        <h2>Pysäkit</h2>

        <ul class="stop-list"></ul>

        <br />

        <button class="driver-button">Kuljettajan nappi, kling</button>`;
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
    console.log("Suunta: " + trip.tripHeadsign);
    document.querySelector("h2").innerHTML = trip.route.longName + " (" + trip.gtfsId + ", " + "suuntaan " + trip.tripHeadsign + "), lähtö klo " + hours + ":" + minutes;
    UI.prototype.renderStops(trip); //TODO: Selvitä miksi tämä ei toimi thisillä
  }
}

UI.prototype.renderStops = function(trip) {
  for (var s of trip.stops) {
    s.count = 0;
    var item = document.createElement("li");
    item.classList.add("stop-" + s.code);
    item.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number' style='font-weight: bold; color: blue;'>" + s.count + "</span></span>";
    stopList.appendChild(item);
    s.node = item;
    stops.push(s);
  }
  NetworkHandler.getNextStop(currentTrip);
  UI.prototype.updateStops([]);
}

UI.prototype.updateStops = function(payload) {
  for (var s of stops) {
    if (currentTrip.stopIndex - 1 <= stops.indexOf(s) && currentTrip.stopIndex + VISIBLE_FUTURE_STOPS >= stops.indexOf(s)) {
      if (s.node.classList.contains("hidden")) {
        s.node.classList.remove("hidden");
      }
    } else {
      if (!s.node.classList.contains("hidden")) {
        s.node.classList.add("hidden");
      }
    }
    if (currentTrip.stopIndex == stops.indexOf(s)) {
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
        if (currentTrip.stopIndex == stops.indexOf(s) + 1) {
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
  for (var s of stops) {
    for (var p of payload) {
      if (s.gtfsId == p.id) {
        var origCount = s.count;
        s.count = p.passengers;
        if (origCount != s.count) {
          var color = s.count === 0? "blue": "red";
          s.node.innerHTML = "<span class='current-stop-marker'></span><span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number' style='font-weight: bold; color: " + color + ";'>" + s.count + "</span></span>";
        }
        return;
      }
    }
  }
}

module.exports = new UI();
