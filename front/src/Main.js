"use strict";



var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

class Main {
    static init() {
      mqttClient.on("message", function (topic, payload) {
        console.log([topic, payload].join(": "));
        UI.addStop(JSON.parse(payload));
      });
      UI.createUI();
      NetworkHandler.getCurrentVehicleData().then(UI.renderStops);
    }
}
