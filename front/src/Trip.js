"use strict";
const STOP_RADIUS = 0.002;
var Geom = require('./Geometry');

function Trip (obj) {
  this.copyProps(obj);
  this.routeIndex = 0;
  this.stopIndex = 0;
  this.hasStarted = false;
}

Trip.prototype.updatePosition = function (coords, stopID) {
  if (this.hasStarted) { // We're on route
    if (coords[0] !== 0 && coords[1] !== 0) {
      this.long = coords[0];
      this.lat = coords[1];
      this.routeIndex = Geom.positionOnRoute(this, coords);
      if (this.routeIndex == -1) {
        throw new Error("Can't determine position on route");
      }
      this.stopIndex = Geom.nextStopIndex(this);
      if (this.stopIndex == -1) {
        throw new Error("Can't determine next stop on route");
      }
      this.nextStopID = this.stops[this.stopIndex].gtfsId;
      if (stopID !== 'undefined' && this.getStopIndex(stopID) !== this.stopIndex) {
        throw new Error("Invalid next stop, expected: " + this.getStopIndex(stopID) + ", actual: " + this.stopIndex +
          ", stopID: " + stopID);
      }
    } else if (stopID !== 'undefined') { // No coords, but we have a stop id
      // FIXME: check if this can reliably be available
      debug("stopID: " + stopID);
      var i = this.getStopIndex(stopID);
      var st = this.getStop(stopID);
      var j = Geom.positionOnRoute(this, [st.lon, st.lat]);
      if (i !== -1 && i >= this.stopIndex && j >= 0 && j > this.routeIndex) {
        this.stopIndex = i;
        this.routeIndex = j;
        this.nextStopID = st.gtfsId;
      } else {
        console.log("Possible invalid stop: " + stopID);
      }
    }


  } else { // Not on route
    if (coords[0] !== 0 && coords[1] !== 0) {
      this.long = coords[0];
      this.lat = coords[1];
      var d = new Date();
      var t = Trip.timeInSecs(d.getHours() + "" + d.getMinutes());
      if ((t - this.startTimeInSecs()) >= 0) { // FIXME: this will break at midnight
        var i = Geom.positionOnRoute(this, coords);
        if (i >=0 && ! Geom.withinRadius(coords, [this.stops[0].lon, this.stops[0].lat])) {
          this.routeIndex = i;
          this.stopIndex = Geom.nextStopIndex(this);
          if (this.stopIndex == -1) {
            throw new Error("Location calculation failure at end stop");
          }
          this.hasStarted = true;
          this.nextStopID = this.stops[this.stopIndex].gtfsId;
          debug("# on route");
        }
      }
    } else if (stopID) {
      var i = this.getStopIndex(stopID);
      var st = this.stops[i];
      if (i !== -1) {
        this.routeIndex = Geom.positionOnRoute(this, [st.lon, st.lat]);
        if (this.routeIndex === -1) {
          throw new Error("Cannot initialize trip from stop id " + stopID);
        }
        this.stopIndex = i;
        this.nextStopID = st.gtfsId;
        this.hasStarted = true;
      }
    }
  }
};

Trip.prototype.getStopIndex = function(stopID) {
  if (stopID) {
    for (var i = 0; i < this.stops.length; i++) {
      if (stopID === this.stops[i].gtfsId) {
        return i;
      }
    }
    return -1;
  }
  console.log("WTF, ! stopID");
  return -1;
};

Trip.prototype.getStop = function (stopID) {
  return this.stops[this.getStopIndex(stopID)]; // undefined, if stop doesn't exist
};

Trip.prototype.initPosition = function () {
  /*var d = new Date();
  var st = d.getHours() + '' + d.getMinutes();*/
  this.updatePosition([this.long, this.lat], this.nextStopID);
};

Trip.prototype.isFirstStop = function (stopID) {
  return this.stops[0].gtfsId === stopID;
};

Trip.prototype.isLastStop = function (stopID) {
  return this.stops[this.stops.length -1].gtfsId === stopID;
};

Trip.prototype.reachedFinalStop = function () {
  return this.stopIndex == this.stops.length - 1;
};

Trip.prototype.startTimeAsString = function() {
  var s = this.start;
  var mins = s.slice(-2);
  var hours = s.slice(0, s.length === 3? 1: 2);
  return hours + ":" + mins;
};

Trip.prototype.getLongName = function () {
  // FIXME: "Hakaniemi-Malmi-Puistolan as.-Ala-Tikkurila"
  var s = '';
  var a = this.route.longName.split('-');
  if (this.tripHeadsign === a[a.length - 1].trim()) {
    return this.route.longName;
  } else {
    for (var i = (a.length - 1); i > 0; i--) {
      s += a[i].trim() + " - "
    }
    s += a[0].trim();
    return s;
  }
};

Trip.prototype.copyProps = function (obj) {
  var a = Object.getOwnPropertyNames(obj);
  for (var i in a) {
    this[a[i]] = obj[a[i]];
  }
};

Trip.prototype.routeNumber = function () {
  return Trip.hslIntToExt(this.desi);
};

Trip.prototype.getDate = function () {
  var d = new Date(this.tst);
  var strDate = d.getFullYear();
  var m = d.getMonth() + 1;
  var dt = d.getDate();
  strDate += m < 10? "0" + m: "" + m;
  strDate += dt < 10? "0" + dt: "" + dt;
  return strDate;
};

Trip.prototype.startTimeInSecs = function () {
  return Trip.timeInSecs(this.start);
  //return ((Math.floor(Number.parseInt(this.start, 10) / 100) * 60) + Number.parseInt(this.start, 10) % 100) * 60;
};

Trip.timeInSecs = function (timestr) {
  return ((Math.floor(Number.parseInt(timestr, 10) / 100) * 60) + Number.parseInt(timestr, 10) % 100) * 60;
};

Trip.hslExtToInt = function(extNum) {
  if (typeof extNum != 'string') {
    throw new TypeError("Incorrect argument type");
  }
  if (extNum === '506') { // FIXME: this shouldn't exist
    return '1' + extNum;
  } else  if (['512K', '550', '550B', '552', '554', '554K'].indexOf(extNum) >= 0) {
    return '2' + extNum;
  } else if (['415', '415N', '451', '519', '519A', '520', '560', '611', '611B', '614',
      '615', '615T', '615TK', '615V', '615VK', '620', '665', '665A'].indexOf(extNum) >= 0) {
    return '4' + extNum;
  } else if (['61', '61V'].indexOf(extNum) >= 0) {
    return '40' + extNum;
  } else if (['1', '1A', '2', '2X', '3', '3X', '4', '4T', '5',
      '6', '6T', '6X', '7A', '7B', '7X', '8', '9', '9X'].indexOf(extNum) >= 0) {
    return '100' + extNum;
  } else if (/^[0-9][0-9][^0-9]*$/.exec(extNum)) {
    return '10' + extNum;
  } else {
    throw new Error("Unknown argument");
  }
};

Trip.hslIntToExt = function(intNum) {
  if (typeof intNum != 'string') {
    throw new TypeError("Incorrect argument type");
  }

  if (intNum === '1506') { // FIXME: this shouldn't exist
    return '506';
  } else if ((['2512K', '2550', '2550B', '2552', '2554', '2554K'].indexOf(intNum) >= 0)) {
    return intNum.replace('2','');
  } else if (['4415', '4415N', '4451', '4519', '4519A', '4520', '4560', '4611', '4611B', '4614',
      '4615', '4615T', '4615TK', '4615V', '4615VK', '4620', '4665', '4665A'].indexOf(intNum) >= 0) {
    return intNum.replace('4', '');
  } else if (['4061', '4061V'].indexOf(intNum) >= 0) {
    return intNum.replace('40', '');
  } else if (['1001', '1001A', '1002', '1002X', '1003', '1003X', '1004', '1004T', '1005',
      '1006', '1006T', '1006X', '1007A', '1007B', '1007X', '1008', '1009', '1009X'].indexOf(intNum) >= 0) {
    return intNum.replace('100', '');
  } else if (/^10[0-9][0-9][^0-9]*$/.exec(intNum)) {
    return intNum.replace('10', '');
  } else {
    throw new Error("Unknown argument");
  }
};

module.exports = Trip;