// MQTT

var api = "http://test"
var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

mqttClient.on('connect', function () {
  mqttClient.subscribe('stoprequests/1234');
  //mqttClient.publish('stoprequests', '{ "stop_id": "HSL-5125", "request_type": "stop" }');
})

mqttClient.on("message", function (topic, payload) {
  console.log([topic, payload].join(": "))
  addStop(JSON.parse(payload));
})

// UI-päivitys

var currentStop;
var driverButton = document.querySelector(".driver-button");
driverButton.addEventListener("click", function() {
  postDriverButton();
});

var stopList = document.querySelector(".stop-list");
var stops = [];

function addStop(payload) {
  // Jos stoppi halutaan poistaa
  if (payload.request_type=="cancel") {
    for (var s of stops) {
      if (s.stop_id == payload.stop_id) {
        var index = stops.indexOf(s);
        if (index > -1) {
          s.count--;
          if (s.count < 1) { // pois näkymästä kokonaan
            stops.splice(index, 1);
            var el = document.querySelector(".stop-"+s.stop_id);
            stopList.removeChild(el);
          } else { // lukumäärää pienemmäksi
              s.node.innerHTML = "ID: " + s.stop_id + ", lkm: " + s.count;
          }
          return;
        }
      }
    }
  }
  // Muutoin lisää
  if (payload.request_type=="stop") {
    for (var s of stops) {
      if (s.stop_id == payload.stop_id) {
        s.count++;
        s.node.innerHTML = "ID: " + s.stop_id + ", lkm: " + s.count;
        return;
      }
    }
    var item = document.createElement("li");
    item.classList.add("stop-"+payload.stop_id);
    item.innerHTML = "ID: " + payload.stop_id + ", lkm: 1";
    stopList.appendChild(item);
    payload.count = 1;
    payload.node = item;
    stops.push(payload);
  }
}

function postDriverButton() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", api + "/stoprequests", true);
  xhttp.send();
}
