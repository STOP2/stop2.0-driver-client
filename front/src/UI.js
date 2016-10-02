class UI {

  constructor() {
      this.driverButton = null;
      this.stopList = null;
      this.stops = [];
  }

  static createUI() {
    document.querySelector(".content").innerHTML = `
          <h2>Pysäkit</h2>

          <ul class="stop-list"></ul>

          <br />

          <button class="driver-button">Kuljettajan nappi, kling</button>`;
    this.driverButton = document.querySelector(".driver-button");
         this.driverButton.addEventListener("click", function() {
           NetworkHandler.postDriverButton();
         });
    this.stopList = document.querySelector(".stop-list");
  }

  static renderStops(trip) {
    var t = trip.start / 60;
    document.querySelector("h2").innerHTML = trip.route.longName + ", lähtö klo " + Math.floor(t / 60) + ":" + (t % 60);
    for (var s of trip.stops) {
      s.count = 0;
      var item = document.createElement("li");
      item.classList.add("stop-" + s.gtfsId);
      item.innerHTML = "<span class='run-animation'>" + s.name + " | <span style='font-weight: bold; color: blue;'>" + s.count + "</span></span>";
      this.stopList.appendChild(item);
      stop.node = item;
      this.stops.push(s);
    }
  }

  static addStop(payload) {
    for (var s of this.stops) {
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

}
