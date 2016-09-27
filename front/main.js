var api = "http://test"
var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

var currentRoute = "";

var currentStop;
var driverButton;
var stopList;

var stops = [];
var stopLoadedData = [];

function init() {
  currentRoute = document.querySelector("#route-name").value;
  createUI();
  getStops();
}

function createUI() {
  document.querySelector(".content").innerHTML = `
        <h2>Pysäkit</h2>

        <ul class="stop-list"></ul>

        <br />

        <button class="driver-button">Kuljettajan nappi, kling</button>`
  driverButton = document.querySelector(".driver-button");
       driverButton.addEventListener("click", function() {
         postDriverButton();
       });
  stopList = document.querySelector(".stop-list");
}

mqttClient.on("message", function (topic, payload) {
  console.log([topic, payload].join(": "))
  addStop(JSON.parse(payload));
})

function getStops() {
  mqttClient.subscribe('stoprequests/' + currentRoute);

  // Hae stopit
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          // Luo nodet
          var s = xmlHttp.responseText.toString();
          document.querySelector("h2").innerHTML = "Pysäkit (" + currentRoute + ")";
          if (s !== undefined) {
            stopLoadedData = JSON.parse(s);
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
              item.innerHTML = "<span class='run-animation'>" + d.name + " | <span style='font-weight: bold; color: " + color + ";'>" + d.count + "</span></span>";
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
    pattern(id:"HSL:1506:0:01") {
        name
        stops{
          gtfsId
          name
        }
      }
    }`);
}

function addStop(payload) {
  for (var s of stops) {
    if (s.gtfsId == payload.stop_id) {
      // Perutaan pysähdys
      if (payload.request_type=="cancel") {
        s.count--;
      // Lisätään pysähdys
      } else if (payload.request_type=="stop") {
        s.count++;
      }
      var color;
      if (s.count === 0) {
        color = "blue";
      } else {
        color = "red";
      }
      s.node.innerHTML = "<span class='run-animation'>" + s.name + " | <span style='font-weight: bold; color: " + color + ";'>" + s.count + "</span></span>";
      return;
    }
  }
}

function postDriverButton() {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", api + "/stoprequests", true);
  xhttp.send();
}
