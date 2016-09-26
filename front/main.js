// MQTT

var api = "http://test"
var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

getStops();

mqttClient.on('connect', function () {
  mqttClient.subscribe('stoprequests');
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
var stopLoadedData = [];

function getStops() {
  // Hae stopit
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          console.log(xmlHttp.responseText);
          // Luo nodet
          for (var d of stopLoadedData) {
            var item = document.createElement("li");
            item.classList.add("stop-" + d.stop_id);
            d.count = 0;
            item.innerHTML = d.stop_id + " | STOPS: " + d.count;
            stopList.appendChild(item);
            d.node = item;
            d.count = 1;
            stops.push(d);
          }
  }
  xmlHttp.open("POST", "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql", true);
  xmlHttp.send(`{
    pattern(id:"HSL:1050:1:01") {
        name
        stops{
          name
        }
      }
    }`);
}

function addStop(payload) {
  for (var s of stops) {
    if (s.stop_id == payload.stop_id) {
      // Perutaan pysähdys
      if (payload.request_type=="cancel") {
        s.count--;
      // Lisätään pysähdys
      } else if (payload.request_Type=="stop") {
        s.count++;
      }
      s.node.innerHTML = s.stop_id + " | STOPS: " + s.count;
      return;
    }
  }
}

function postDriverButton() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", api + "/stoprequests", true);
  xhttp.send();
}
