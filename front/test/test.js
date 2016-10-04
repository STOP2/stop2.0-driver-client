//var chai = require('chai');
//var assert = chai.assert;
//var sinon = require('sinon');
chai.should();
chai.expect();

describe('NetworkHandler', function() {
  var xhr;
  var requests;
  var HSLData = '{"/hfp/journey/bus/1210/1075/2/XXX/1942/1413118/60;25/20/56/53":' +
    '{"VP":' +
    '{"desi":"1075","dir":"2","oper":"XXX","veh":"1210","tst":"2016-10-03T16:52:10.017Z",' +
    '"tsi":1475513530,"spd":1.11,"lat":60.25511,"long":25.06368,"dl":62,' +
    '"oday":"XXX","jrn":"XXX","line":"1075","start":"1942"}}}';

  var testTripData = {'vehicle': '1210',
    'line': 'HSL:1075',
    'direction': 1,
    'start': 70920,
    'timeStr': "2016-10-03T16:52:10.017Z",
    'date': '20161003'};

  var GraphQLResponse = `{
  "data": {
    "fuzzyTrip": {
      "gtfsId": "HSL:1075_20160905_Ma_2_1942",
        "tripHeadsign": "Rautatientori",
        "route": {
        "longName": "Rautatientori - Tattarisuo - Puistolan asema"
        },
      "stops": [
        {
          "gtfsId": "HSL:1402125",
          "name": "Tapuliaukio"
        },
        {
          "gtfsId": "HSL:1402152",
          "name": "Hatuntekijänkuja"
        },
        {
          "gtfsId": "HSL:1411131",
          "name": "Terrintie"
        },
        {
          "gtfsId": "HSL:1411128",
          "name": "Puistolan tori"
        },
        {
          "gtfsId": "HSL:1411110",
          "name": "Karrintie"
        },
        {
          "gtfsId": "HSL:1411125",
          "name": "Puistolan kirkko"
        },
        {
          "gtfsId": "HSL:1411123",
          "name": "Puistolan VPK"
        },
        {
          "gtfsId": "HSL:1412120",
          "name": "Nummitie"
        },
        {
          "gtfsId": "HSL:1412118",
          "name": "Heikinlaakso"
        },
        {
          "gtfsId": "HSL:1412133",
          "name": "Kalliotie"
        },
        {
          "gtfsId": "HSL:1413117",
          "name": "Suurmetsäntie"
        },
        {
          "gtfsId": "HSL:1413115",
          "name": "Tattarisuontie"
        },
        {
          "gtfsId": "HSL:1413118",
          "name": "Hevosmiehenkatu"
        },
        {
          "gtfsId": "HSL:1413113",
          "name": "Jarrutie"
        },
        {
          "gtfsId": "HSL:1385162",
          "name": "Harkkoraudantie"
        },
        {
          "gtfsId": "HSL:1385152",
          "name": "Kankiraudantie"
        },
        {
          "gtfsId": "HSL:1385150",
          "name": "Malmin lentoasema"
        },
        {
          "gtfsId": "HSL:1385148",
          "name": "Valuraudantie"
        },
        {
          "gtfsId": "HSL:1382148",
          "name": "Usvatie"
        },
        {
          "gtfsId": "HSL:1382146",
          "name": "Raetie"
        },
        {
          "gtfsId": "HSL:1382144",
          "name": "Latokartanontie"
        },
        {
          "gtfsId": "HSL:1383114",
          "name": "Seppämestarintie"
        },
        {
          "gtfsId": "HSL:1383112",
          "name": "Malmin hautausmaa"
        },
        {
          "gtfsId": "HSL:1383110",
          "name": "Meripihkatie"
        },
        {
          "gtfsId": "HSL:1383108",
          "name": "Pihlajistontie"
        },
        {
          "gtfsId": "HSL:1363101",
          "name": "Viikki"
        },
        {
          "gtfsId": "HSL:1240123",
          "name": "Valtimontie"
        },
        {
          "gtfsId": "HSL:1240106",
          "name": "Sumatrantie"
        },
        {
          "gtfsId": "HSL:1240118",
          "name": "Kumpulan kampus"
        },
        {
          "gtfsId": "HSL:1220127",
          "name": "Paavalin kirkko"
        },
        {
          "gtfsId": "HSL:1220104",
          "name": "Vallilan varikko"
        },
        {
          "gtfsId": "HSL:1220102",
          "name": "Ristikkokatu"
        },
        {
          "gtfsId": "HSL:1113131",
          "name": "Sörnäinen(M)"
        },
        {
          "gtfsId": "HSL:1112126",
          "name": "Haapaniemi"
        },
        {
          "gtfsId": "HSL:1111114",
          "name": "Hakaniemi"
        },
        {
          "gtfsId": "HSL:1020106",
          "name": "Kaisaniemenpuisto"
        },
        {
          "gtfsId": "HSL:1020201",
          "name": "Rautatientori"
        }
      ]
    }
  }
}`;

  beforeEach(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];

    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };

  });

  describe('#getHSLRealTimeAPIData', function () {
    it('should return a promise with valid data', function(){
      NetworkHandler.getHSLRealTimeAPIData("GET", RT_API_URL + 1210 + "/").then(function(result){
        result.should.deep.equal(HSLData);
      });
      requests[0].respond(200, {'Content-Type': 'text/json'}, HSLData);
    });

    it('should in case of failure return an Error object', function(){
      NetworkHandler.getHSLRealTimeAPIData("GET", RT_API_URL + 1210 + "/").catch(function(result){
        result.should.be.a('Error');
      });
      requests[0].respond(404, {'Content-Type': 'text/html'}, 'no such thing here');
    });
  });

  describe('#parseHSLRealTimeData', function () {
    it('should return a valid trip data object', function () {
      var d =  NetworkHandler.parseHSLRealTimeData(HSLData);
      d.should.deep.equal(testTripData);
    });

    it('should throw an error if input is "{}"', function () {
      chai.expect(NetworkHandler.parseHSLRealTimeData.bind(NetworkHandler, '{}')).to.throw(Error);
      });

    it('should throw an error if input is ""', function () {
      chai.expect(NetworkHandler.parseHSLRealTimeData.bind(NetworkHandler, '')).to.throw(Error);
    });

    it('should throw an error if given invalid input', function () {
      chai.expect(NetworkHandler.parseHSLRealTimeData.bind(NetworkHandler, '{"foo": {"bar": "baz"}}')).to.throw(Error);
    });
  });

  describe('#getHSLTripData', function () {
    it('should return a promise with valid data', function () {
      NetworkHandler.getHSLTripData(testTripData).then(function (result) {
        result.should.deep.equal(JSON.parse(GraphQLResponse));
      });
      requests[0].respond(200, {'Content-Type': 'application/json'}, GraphQLResponse);
    });

    it('should return an Error in case of failure', function () {
      NetworkHandler.getHSLTripData(testTripData).then(function (result) {
        result.should.be.a('Error');
      });
      requests[0].respond(404, {'Content-Type': 'application/html'}, 'nopenopenope');
    });
  });
});




