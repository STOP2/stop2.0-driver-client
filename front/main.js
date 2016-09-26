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
          // Luo nodet
          var s = xmlHttp.responseText.toString();
          if (s !== undefined) {
            stopLoadedData = JSON.parse(s);
            console.log(stopLoadedData);
            for (var d of stopLoadedData.data.pattern.stops) {
              var item = document.createElement("li");
              item.classList.add("stop-" + d.name.replace(/\s/g, ''));
              d.count = 0;
              var color;
              if (d.count === 0) {
                color = "blue";
              } else {
                color = "red";
              }
              item.innerHTML = d.name + " | STOPS: <span style='font-weight: bold; color: " + color + ";'>" + d.count + "</span>";
              stopList.appendChild(item);
              d.node = item;
              d.count = 1;
              stops.push(d);
            }
          }
  }
  xmlHttp.open("POST", "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql", true);
  xmlHttp.setRequestHeader("Content-type", "application/graphql");
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
    if (s.name == payload.stop_id) {
      // Perutaan pysähdys
      if (payload.request_type=="cancel") {
        s.count--;
      // Lisätään pysähdys
      } else if (payload.request_Type=="stop") {
        s.count++;
      }
      var color;
      if (s.count === 0) {
        color = "blue";
      } else {
        color = "red";
      }
      s.node.innerHTML = s.name + " | STOPS: <span style='font-weight: bold; color: " + color + ";'>" + s.count + "</span>";
      return;
    }
  }
}

function postDriverButton() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", api + "/stoprequests", true);
  xhttp.send();
}
