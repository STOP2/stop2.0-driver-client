"use strict";
const DEVIATION = 0.0003;

var Geometry = function() {};

/**
 * Finds and returns the index of current position in the
 * route geometry graph contained in trip.
 * @param trip - Object containing all data pertaining to a bus trip
 * @param currentPos - The current location as GPS coordinates ([long, lat])
 * @returns {number} - The index corresponding to the current position
 */
Geometry.prototype.positionOnRoute = function(trip, currentPos) {
  var geom = trip.geometry;
  var stops = trip.stops;

  for (var i = 0; i < geom.length - 1; i++) {
    if (this.isBetweenPoints(geom[i], geom[i + 1], currentPos)||
        this.withinRadius(geom[i], currentPos)) {
      return i;
    } else if (i === 0 && this.withinRadius(geom[0], currentPos)) {
      return 0;
    } else if (this.withinRadius([stops[stops.length - 1].lon, stops[stops.length - 1].lat], currentPos)) {
      return geom.length - 1;
    }
  }
  return -1;
};

/**
 * Finds out whether location is between point1 and point2
 * @param point1 - An array representing the GPS location of a point [long, lat]
 * @param point2 - An array representing the GPS location of a point [long, lat]
 * @param location - An array representing the GPS location of a poin [long, lat]
 * @returns {boolean} true if location is between point1 and point2
 */
Geometry.prototype.isBetweenPoints = function (point1, point2, location) {
  var vectorA = this.locatedVector(point1, point2);
  var posVector = this.locatedVector(point1, location);
  var c = this.component(posVector, vectorA);
  var tmp = [vectorA[0] * c - posVector[0], vectorA[1] * c - posVector[1]];
  var n = this.norm(tmp);

  return (c > 0 && c < 1 && n < DEVIATION)? true : false;
};


/**
 * Finds out whether p1 is within a certain distance (DEVIATION) from p2
 * @param p1 - GPS coordinates having form [longitude, latitude]
 * @param p2 - GPS coordinates ([longitude, latitude])
 * @param radius - The radius within which point p1 is from p2 (or vice versa)
 * @returns {boolean} - true if points are within DEVIATION, false otherwise
 */
Geometry.prototype.withinRadius = function (p1, p2, radius) {
  var num = radius? radius: DEVIATION;
  return this.norm(this.locatedVector(p1, p2)) < num;
};

/**
 * Finds out the index of the next stop on the route
 * @param trip - Object containing all data pertaining to a trip
 * @returns {number} - The index (starting at 0) of the next stop on route
 */
Geometry.prototype.nextStopIndex = function(trip) {
  var stoplist = trip.stops;
  var geom = trip.geometry;

  if (trip.stopIndex === undefined) {
    trip.stopIndex = 0;
  }

  if (trip.routeIndex == 0 && trip.stopIndex == 0) {
    return 0;
  } else if (trip.routeIndex == geom.length -  1) {
    return stoplist.length - 1;
  }
  for (var i = trip.routeIndex; i < geom.length - 1; i++) {
    for (var j = trip.stopIndex; j < stoplist.length; j++) {
      var stopLoc = [stoplist[j].lon, stoplist[j].lat];
      if (this.isBetweenPoints(geom[i], geom[i+1], stopLoc) ||
          this.withinRadius(geom[i], stopLoc) ||
          this.withinRadius(geom[i+1], stopLoc)) {
        return j;
      }
    }
  }
  return -1;
};

/**
 * Calculates the located vector between two points (p1 -> p2)
 * @param point1 - GPS coordinates
 * @param point2 - GPS coordinates
 * @returns {*[]} - a point representing the located vector
 */
Geometry.prototype.locatedVector = function(point1, point2) {
  return [point2[0] - point1[0], point2[1] - point1[1]];
};

/**
 * Calculates the component of vectorA along vectorB
 * @param vectorA - a located vector
 * @param vectorB - a located vector
 * @returns {number} - the component of vectorA along vectorB
 */
Geometry.prototype.component = function(vectorA, vectorB) {
  return (vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1]) /
         (vectorB[0] * vectorB[0] + vectorB[1] * vectorB[1]);
};

/**
 * Calculates the norm of a vector.
 * @param vector - an array of two elements representing a vector
 * @returns {number} - the norm of vector
 */
Geometry.prototype.norm = function(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
};

module.exports = new Geometry();