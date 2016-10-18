"use strict";

var UI = function() {}
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

UI.prototype.renderStops = function(trip) {
  console.log("Trip:");
  console.log(trip);
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
    console.log(trip.tripHeadsign);
    document.querySelector("h2").innerHTML = trip.route.longName + " (" + trip.gtfsId + ", " + "suuntaan " + trip.tripHeadsign + "), lähtö klo " + hours + ":" + minutes;
    for (var s of trip.stops) {
      s.count = 0;
      var item = document.createElement("li");
      item.classList.add("stop-" + s.code);
      item.innerHTML = "<span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number' style='font-weight: bold; color: blue;'>" + s.count + "</span></span>";
      stopList.appendChild(item);
      s.node = item;
      stops.push(s);
    }
  }
}

UI.prototype.updateStops = function(payload) {
  for (var s of stops) {
    for (var p of payload) {
      if (s.gtfsId == p.id) {
        var origCount = s.count;
        s.count = p.passengers;
        if (origCount != s.count) {
          var color = s.count === 0? "blue": "red";
          s.node.innerHTML = "<span class='run-animation'>" + s.name + " (" + s.code + ") <span class='number' style='font-weight: bold; color: " + color + ";'>" + s.count + "</span></span>";
        }
        return;
      }
    }
  }
}

module.exports = new UI();
