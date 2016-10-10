"use strict";

var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");
var vehicleId = -1;

class Main {
    static init() {
      vehicleId = document.getElementById('vehicle-name').value;
      mqttClient.on("message", function (topic, payload) {
        console.log([topic, payload].join(": "));
        UI.addStop(JSON.parse(payload));
      });
      UI.createUI();
      NetworkHandler.getCurrentVehicleData(vehicleId).then(UI.renderStops);
    }
}
