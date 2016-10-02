class NetworkHandler {

  constructor() {
    this.tripData = null;
  }

  static hslRealTimeAPIHandler() {
    if (this.status == 200 && this.responseText) {
      this.tripData = NetworkHandler.parseHSLRealTimeData(this.responseText);
      var queryStr = `{
        fuzzyTrip(route: "${this.tripData.line}", direction: ${this.tripData.direction}, date: "${this.tripData.date}", time: ${this.tripData.start})
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
      r.open("POST", HSL_API, true);
      r.setRequestHeader("Content-type", "application/graphql");
      r.send(queryStr);
    } else {
      console.log("Connection to HSL real time API failed");
    }
  }

  static parseHSLRealTimeData(str) {
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

  static hslTripQueryHandler() {
    if (this.status == 200 && this.responseText != null) {
      var queryRes = JSON.parse(this.responseText).data.fuzzyTrip;
      this.tripData.stops = queryRes.stops;
      this.tripData.route = queryRes.route;
      UI.renderStops(this.tripData);
    } else {
      console.log("Connection to HSL GraphQL service failed");
    }
  }

  static getCurrentVehicleData() {
    var r = new XMLHttpRequest();
    r.open("GET", RT_API_URL + BUS_ID + "/"); // asynchronous by default
    r.onload = NetworkHandler.hslRealTimeAPIHandler;
    r.send();
  }

  static postDriverButton() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", STOP_API + "/stoprequests", true);
    xhttp.send();
  }

}
