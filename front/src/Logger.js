"use strict";

/*

Debug logger - replacement for console.log

*/

var Logger = function(){};

// Setup the debug function
Logger.prototype.init = function() {
  if (DEBUG_MODE) {
    window.debug = console.log.bind(window.console);
    debug.warn = console.warn.bind(window.console);
    debug.error = console.error.bind(window.console);
  }
  else window.debug = function(){}
}

module.exports = new Logger();
