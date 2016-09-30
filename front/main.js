const RT_API_URL = "http://dev.hsl.fi/hfp/journey/bus/";
const BUS_ID = 1209;
var api = "http://test";
var mqttClient = mqtt.connect("ws://epsilon.fixme.fi:9001");

var currentRoute = "";
var tripData;
var currentStop;
var driverButton;
var stopList;

var stops = [];

function hslRealTimeAPIHandler() {
  if (this.status == 200 && this.responseText) {
    tripData = parseHSLRealTimeData(this.responseText);
    var queryStr = `{
      fuzzyTrip(route: "${tripData.line}", direction: ${tripData.direction}, date: "${tripData.date}", time: ${tripData.start})
      { 
        gtfsId
        stops
        { 
          gtfsId
          name
        }
        route
        {
          longName
        }
      }
}`;

    var r = new XMLHttpRequest();
    r.onload = hslTripQueryHandler;
    r.open("POST", "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql", true);
    r.setRequestHeader("Content-type", "application/graphql");
    r.send(queryStr);
  } else {
    console.log("Connection to HSL real time API failed");
  }
}

function parseHSLRealTimeData(str) {
  var tmpobj = JSON.parse(str);
  if (!tmpobj) {
    return null;
  }
  tmpobj = tmpobj[Object.keys(tmpobj)[0]]["VP"];
  var d = new Date(tmpobj.tst);
  var strDate = d.getUTCFullYear();
  var m = d.getMonth() + 1;
  strDate += m < 10? "0" + m: m;
  strDate += d.getUTCDate();
  return {
    vehicle: tmpobj.veh,
    line: "HSL:" + tmpobj.line,
    direction: tmpobj.dir - 1,
    start: ((Math.floor(tmpobj.start / 100) * 60) + tmpobj.start % 100) * 60,
    timeStr: tmpobj.tst,
    date: strDate
  }
}

function hslTripQueryHandler() {
  if (this.status == 200 && this.responseText != null) {
    var queryRes = JSON.parse(this.responseText).data.fuzzyTrip;
    tripData.stops = queryRes.stops;
    tripData.route = queryRes.route;
    renderStops(tripData);
  } else {
    console.log("Connection to HSL GraphQL service failed");
  }
}

function getCurrentVehicleData() {
  var r = new XMLHttpRequest();
  r.open("GET", RT_API_URL + BUS_ID + "/"); // asynchronous by default
  r.onload = hslRealTimeAPIHandler;
  r.send();
}

function init() {
  createUI();
  getCurrentVehicleData();
}


function createUI() {
  document.querySelector(".content").innerHTML = `
        <h2>Pysäkit</h2>

        <ul class="stop-list"></ul>

        <br />

        <button class="driver-button">Kuljettajan nappi, kling</button>`;
  driverButton = document.querySelector(".driver-button");
       driverButton.addEventListener("click", function() {
         postDriverButton();
       });
  stopList = document.querySelector(".stop-list");
}

mqttClient.on("message", function (topic, payload) {
  console.log([topic, payload].join(": "));
  addStop(JSON.parse(payload));
});

function renderStops(trip) {
  var t = trip.start / 60;
  document.querySelector("h2").innerHTML = trip.route.longName + ", lähtö klo " + Math.floor(t / 60) + ":" + (t % 60);
  for (var s of trip.stops) {
    s.count = 0;
    var item = document.createElement("li");
    item.classList.add("stop-" + s.gtfsId);
    item.innerHTML = "<span class='run-animation'>" + s.name + " | <span style='font-weight: bold; color: blue;'>" + s.count + "</span></span>";
    stopList.appendChild(item);
    stop.node = item;
    stops.push(s);
  }
}

function addStop(payload) {
  for (var s of stops) {
    if (s.gtfsId == payload.stop_id) {
      // Perutaan pysähdys
      if (payload.request_type=="cancel") {
        if (s.count == 0) return;
        s.count--;
      // Lisätään pysähdys
      } else if (payload.request_type=="stop") {
        s.count++;
      }
      var color = s.count === 0? "blue": "red";
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

init();