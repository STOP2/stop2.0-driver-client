"use strict";

var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

class Main {
    static init() {
      var vehicleName = document.getElementById('vehicle-name').value;
      mqttClient.on("message", function (topic, payload) {
        console.log([topic, payload].join(": "));
        UI.addStop(JSON.parse(payload));
      });
      UI.createUI();
      NetworkHandler.getCurrentVehicleData(vehicleName).then(UI.renderStops);
    }
}
