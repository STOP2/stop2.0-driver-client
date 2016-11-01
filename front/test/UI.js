var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
chai.should();
var UI = require('../src/UI');

describe('UI', function() {
  var extLines = ['506', '512K', '550', '550B', '552', '554', '554K', '415', '415N', '451', '519',
    '519A', '520', '560', '611', '611B', '614', '615', '615T', '615TK', '615V', '615VK', '620', '665', '665A',
    '61', '61V',    '1', '1A', '2', '2X', '3', '3X', '4', '4T', '5', '6', '6T', '6X', '7A', '7B', '7X', '8', '9', '9X',
    '10', '14', '15', '16', '17', '18', '18N', '19', '19E', '20', '20N', '20X', '21BX', '21V', '23',
    '23N', '24', '24X', '26', '31', '32', '33', '34', '35', '36', '37', '39', '39B', '39N', '40', '41',
    '42', '43', '50', '51', '52', '54', '55', '56', '57', '58', '58B', '59', '63', '64', '65', '66', '66K',
    '67', '67N', '67V', '68', '69', '70', '70T', '71', '71V', '72', '72N', '73', '73N', '74', '74N', '75',
    '75A', '76A', '76B', '76N', '77', '77A', '79', '80', '81', '82', '82B', '83', '84', '85', '85B', '85N', '86',
    '86N', '88', '89', '90', '90A', '90N', '91', '91K', '92', '92N', '93', '93K', '94', '94A', '94B',
    '94N', '95', '95N', '96', '96N', '97', '97N', '97V', '98' ];

  var intLines = ['1506', '2512K', '2550', '2550B', '2552', '2554', '2554K', '4415', '4415N', '4451', '4519',
    '4519A', '4520', '4560', '4611', '4611B', '4614', '4615', '4615T', '4615TK', '4615V', '4615VK', '4620',
    '4665', '4665A', '4061', '4061V',  '1001', '1001A', '1002', '1002X', '1003', '1003X', '1004', '1004T', '1005',
    '1006', '1006T', '1006X', '1007A', '1007B', '1007X', '1008', '1009', '1009X', '1010', '1014', '1015',
    '1016', '1017', '1018', '1018N', '1019', '1019E', '1020', '1020N',
    '1020X', '1021BX', '1021V', '1023', '1023N', '1024', '1024X', '1026', '1031', '1032',
    '1033', '1034', '1035', '1036', '1037', '1039', '1039B', '1039N', '1040', '1041', '1042',
    '1043', '1050', '1051', '1052', '1054', '1055', '1056', '1057', '1058', '1058B', '1059',
    '1063', '1064', '1065', '1066', '1066K', '1067', '1067N', '1067V', '1068', '1069', '1070',
    '1070T', '1071', '1071V', '1072', '1072N', '1073', '1073N', '1074', '1074N', '1075', '1075A',
    '1076A', '1076B', '1076N', '1077', '1077A', '1079', '1080', '1081', '1082', '1082B', '1083',
    '1084', '1085', '1085B', '1085N', '1086', '1086N', '1088', '1089', '1090', '1090A', '1090N',
    '1091', '1091K', '1092', '1092N', '1093', '1093K', '1094', '1094A', '1094B', '1094N', '1095',
    '1095N', '1096', '1096N', '1097', '1097N', '1097V', '1098',
  ];

  describe("#hslIntToExt", function() {
    it('should produce correct output given correct input', function() {
      for (var i = 0; i < intLines.length; i++) {
        extLines[i].should.equal(UI.hslIntToExt(intLines[i]));
      }
    });

    it('produce an exception when called with a wrong type argument', function() {
      chai.expect(UI.hslIntToExt.bind(UI, 553)).to.throw(TypeError);
    });

    it('produce an exception when called with a wrong argument', function() {
      chai.expect(UI.hslIntToExt.bind(UI, '111558')).to.throw(Error);
    });

  });

  describe("#hslExtToInt", function() {
    it('should produce correct output given correct input', function() {
      for (var i = 0; i < intLines.length; i++) {
        intLines[i].should.equal(UI.hslExtToInt(extLines[i]));
      }
    });

    it('produce an exception when called with a wrong type argument', function() {
      chai.expect(UI.hslExtToInt.bind(UI, 553)).to.throw(TypeError);
    });

    it('produce an exception when called with a wrong argument', function() {
      chai.expect(UI.hslExtToInt.bind(UI, '558')).to.throw(Error);
    });
  });
});