//var chai = require('chai');
//var assert = chai.assert;


suite('HSL real time');

test('parseHSLRealTimeData success', function() {
  var s = '{"/hfp/journey/bus/1313/2550/2/XXX/1206/2222234/60;24/18/82/04":{"VP":{"desi":"2550","dir":"2","oper":"XXX","veh":"1313","tst":"2016-09-28T09:11:50.333Z","tsi":1475053910,"spd":0.56,"lat":60.1803,"long":24.8248,"dl":18,"oday":"XXX","jrn":"XXX","line":"2550","start":"1206"}}}';
  var resObj = parseHSLRealTimeData(s);
  var myObj = {"start": 1206, "line": "HSL:2550", "vehicle": 1313, "direction": 1, "time": 1206};
  assert(myObj.line == resObj.line);
});