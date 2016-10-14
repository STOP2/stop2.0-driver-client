var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var NetworkHandler = require('../src/NetworkHandler');

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
    'lat': 60.25511,
    'long': 25.06368,
    'start': 70920,
    'timeStr': "2016-10-03T16:52:10.017Z",
    'date': '20161003'};

  var GraphQLResponse = `{
  "data": {
    "fuzzyTrip": {
      "gtfsId": "HSL:1075_20160926_Ma_2_1942",
      "tripHeadsign": "Rautatientori",
      "route": {
        "longName": "Rautatientori - Tattarisuo - Puistolan asema"
      },
      "geometry": [
        [ 25.035327795074164, 60.27532190185115 ], [ 25.0354558, 60.2753065 ], [ 25.0355154, 60.2752986 ],
        [ 25.0355598, 60.2752928 ], [ 25.0357338, 60.2752711 ], [ 25.0357527, 60.2753368 ], [ 25.0357475, 60.2754063 ],
        [ 25.0357199, 60.2754699 ], [ 25.0356869, 60.2755055 ], [ 25.0356313, 60.2755737 ], [ 25.0355701, 60.2756124 ],
        [ 25.035419, 60.2757012 ], [ 25.0353144, 60.2757615 ], [ 25.0349993, 60.275941 ], [ 25.0345849, 60.2761843 ],
        [ 25.0344963, 60.2762719 ], [ 25.0344511, 60.2763428 ], [ 25.0344392, 60.2764316 ], [ 25.0344407, 60.2765111 ],
        [ 25.0344661, 60.2765804 ], [ 25.034608652342165, 60.276906684840846 ], [ 25.0346603, 60.2770249 ],
        [ 25.0347, 60.2770962 ], [ 25.0348772, 60.2774754 ], [ 25.0348939, 60.2775104 ], [ 25.0349696, 60.2776384 ],
        [ 25.0352737, 60.2775637 ], [ 25.0355525, 60.2775093 ], [ 25.0363833, 60.2773782 ], [ 25.0379652, 60.2770329 ],
        [ 25.0394383, 60.2766776 ], [ 25.0403913, 60.2764389 ], [ 25.0405857, 60.2763849 ], [ 25.0411716, 60.2762269 ],
        [ 25.04119278598745, 60.27622093355756 ], [ 25.042952, 60.2757255 ], [ 25.0433269, 60.2756174 ],
        [ 25.0435182, 60.2755101 ], [ 25.0436432, 60.2754399 ], [ 25.0438012, 60.2753576 ], [ 25.0439907, 60.2752039 ],
        [ 25.0440382, 60.27511 ], [ 25.0440939, 60.2749252 ], [ 25.0441275, 60.2748137 ], [ 25.0441585, 60.2747195 ],
        [ 25.04426943416664, 60.27441673171261 ], [ 25.0442911, 60.2743576 ], [ 25.0443835, 60.2742799 ],
        [ 25.044392, 60.2742123 ], [ 25.0444008, 60.2741795 ], [ 25.0444241, 60.2740922 ], [ 25.0444502, 60.2739986 ],
        [ 25.0445717, 60.2735593 ], [ 25.0446172, 60.2734301 ], [ 25.0446434, 60.2733201 ], [ 25.0448086, 60.2727647 ],
        [ 25.044825, 60.272709 ], [ 25.0448441, 60.2726436 ], [ 25.0450259, 60.2720523 ], [ 25.0450478, 60.2719907 ],
        [ 25.0451413, 60.2717604 ], [ 25.0451734, 60.271692 ], [ 25.0451539, 60.271524 ], [ 25.0451613, 60.2714885 ],
        [ 25.0451879, 60.2714083 ], [ 25.0452321, 60.2713298 ], [ 25.0453898, 60.2713304 ], [ 25.0455403, 60.2713309 ],
        [ 25.046549377049836, 60.27134221812569 ], [ 25.0469133, 60.2713463 ], [ 25.0470927, 60.2713525 ],
        [ 25.0472869, 60.271387 ], [ 25.0474661, 60.271377 ], [ 25.0476896, 60.271362 ], [ 25.0479876, 60.2713301 ],
        [ 25.0497929, 60.2710968 ], [ 25.0500699, 60.2710641 ], [ 25.0503131, 60.2710495 ], [ 25.0505084, 60.2710425 ],
        [ 25.0507586, 60.2709977 ], [ 25.0510854, 60.2709937 ], [ 25.05183, 60.2709937 ], [ 25.0521148, 60.2709887 ],
        [ 25.0523417, 60.2709799 ], [ 25.0525846, 60.2709542 ], [ 25.0526309, 60.2709473 ], [ 25.0527516, 60.270954 ],
        [ 25.0528793, 60.2709207 ], [ 25.0530365, 60.2708703 ], [ 25.0532257, 60.2707874 ],
        [ 25.05334792340742, 60.270724391488336 ], [ 25.0535801, 60.2706047 ], [ 25.0540068, 60.2703445 ],
        [ 25.0543247, 60.270192 ], [ 25.0545138, 60.2701209 ], [ 25.0547036, 60.2700607 ], [ 25.0550006, 60.2699867 ],
        [ 25.0552505, 60.2699473 ], [ 25.0554889, 60.2699207 ], [ 25.0557201, 60.2699067 ], [ 25.0558205, 60.2699039 ],
        [ 25.0559569, 60.2699002 ], [ 25.0561692, 60.2699058 ], [ 25.0563571, 60.2699179 ], [ 25.056736, 60.2699518 ],
        [ 25.0568656, 60.2699633 ], [ 25.0570086, 60.2699784 ], [ 25.0578368, 60.2700578 ], [ 25.0584961, 60.2701158 ],
        [ 25.058702, 60.2701158 ], [ 25.05872295569977, 60.27011727981089 ], [ 25.0599241, 60.2702021 ],
        [ 25.0600386, 60.2702049 ], [ 25.0601914, 60.2702005 ], [ 25.060381, 60.2701924 ], [ 25.060682, 60.2701452 ],
        [ 25.0614731, 60.270021 ], [ 25.0615364, 60.2700093 ], [ 25.0617714, 60.269965 ], [ 25.0617858, 60.2699474 ],
        [ 25.0618022, 60.2699342 ], [ 25.0618392, 60.2699151 ], [ 25.0618779, 60.2699031 ], [ 25.0619208, 60.2698957 ],
        [ 25.0619853, 60.2698937 ], [ 25.0620272, 60.269898 ], [ 25.0620627, 60.2699056 ], [ 25.0621144, 60.2699256 ],
        [ 25.0623333, 60.2698904 ], [ 25.0632653, 60.26976 ], [ 25.0635257, 60.26975 ], [ 25.0639067, 60.2697037 ],
        [ 25.064098, 60.2696814 ], [ 25.0643518, 60.2696499 ], [ 25.064476994715555, 60.2696407198964 ],
        [ 25.0646491, 60.2696281 ], [ 25.0650503, 60.2696227 ], [ 25.0653457, 60.2696318 ], [ 25.0656842, 60.2696509 ],
        [ 25.0663396, 60.2696931 ], [ 25.0674717, 60.2697616 ], [ 25.0675511, 60.2697651 ], [ 25.068233, 60.2698148 ],
        [ 25.0685575, 60.2698155 ], [ 25.0696524, 60.2698731 ], [ 25.0707434, 60.2699321 ], [ 25.0711069, 60.2699492 ],
        [ 25.071254, 60.2699566 ], [ 25.0721348, 60.2700102 ], [ 25.0722886, 60.2700284 ], [ 25.0723773, 60.2700343 ],
        [ 25.0726705, 60.2700537 ], [ 25.0727591, 60.2700576 ], [ 25.0728874, 60.2700631 ], [ 25.0729539, 60.270064 ],
        [ 25.0729888, 60.270034 ], [ 25.0730366, 60.2700125 ], [ 25.0730429, 60.2699622 ], [ 25.0730213, 60.2699118 ],
        [ 25.0729439, 60.2697998 ], [ 25.07279975764382, 60.26959314524062 ], [ 25.072726, 60.2694874 ],
        [ 25.0726474, 60.2693818 ], [ 25.0725546, 60.2692422 ], [ 25.0724961, 60.2691163 ], [ 25.0723043, 60.2688582 ],
        [ 25.072144, 60.2686318 ], [ 25.0720306, 60.2684624 ], [ 25.0719478, 60.2683327 ], [ 25.0718939, 60.2682331 ],
        [ 25.0718331, 60.2680825 ], [ 25.0717076, 60.2676694 ], [ 25.0716338, 60.2674157 ], [ 25.0715723, 60.2671948 ],
        [ 25.0715594, 60.2671253 ], [ 25.0715391, 60.2670543 ], [ 25.0714752, 60.2668013 ], [ 25.0713789, 60.2666485 ],
        [ 25.071377641452496, 60.26664370821129 ], [ 25.071314, 60.2664014 ], [ 25.0711953, 60.2659911 ],
        [ 25.0711563, 60.2658344 ], [ 25.0711282, 60.2656995 ], [ 25.0711348, 60.2650137 ], [ 25.071071, 60.2648122 ],
        [ 25.0710333, 60.2646925 ], [ 25.0708192, 60.2644566 ], [ 25.070634, 60.2643125 ], [ 25.0702043, 60.2640547 ],
        [ 25.0699503, 60.2639146 ], [ 25.069671, 60.2638067 ], [ 25.0694986, 60.2637077 ], [ 25.0693806, 60.2636211 ],
        [ 25.069064, 60.2633731 ], [ 25.0690435, 60.2633557 ], [ 25.0689051, 60.2632707 ], [ 25.0688122, 60.2632662 ],
        [ 25.0687385, 60.2632497 ], [ 25.0686771, 60.2632226 ], [ 25.0686396, 60.2631927 ], [ 25.068618, 60.2631553 ],
        [ 25.0686199, 60.2631144 ], [ 25.0686399, 60.2630824 ], [ 25.0686707, 60.2630569 ], [ 25.0686406, 60.2630019 ],
        [ 25.0686169, 60.2629488 ], [ 25.0685528, 60.2628564 ], [ 25.0685004, 60.2627944 ],
        [ 25.068373956098394, 60.26265170658324 ], [ 25.0683331, 60.2626056 ], [ 25.0682067, 60.2624365 ],
        [ 25.0680202, 60.2621872 ], [ 25.0679809, 60.2620723 ], [ 25.0676965, 60.2617263 ], [ 25.0674816, 60.2615474 ],
        [ 25.0674679, 60.2615334 ], [ 25.0673848, 60.2614485 ], [ 25.067078, 60.2611094 ], [ 25.0669527, 60.2609897 ],
        [ 25.0668053, 60.2608739 ], [ 25.0664122, 60.260615 ], [ 25.0657058, 60.2602156 ], [ 25.0652827, 60.2599247 ],
        [ 25.0650851, 60.2597614 ], [ 25.0649735, 60.2596616 ], [ 25.0648759, 60.2595647 ], [ 25.0648231, 60.2594961 ],
        [ 25.0646924, 60.259372 ], [ 25.0644377, 60.2590604 ], [ 25.064402, 60.2590212 ], [ 25.0643216, 60.2589056 ],
        [ 25.0642782, 60.2588982 ], [ 25.0642386, 60.2588868 ], [ 25.0642042, 60.2588718 ], [ 25.0641763, 60.2588537 ],
        [ 25.0641561, 60.2588333 ], [ 25.0641443, 60.2588113 ], [ 25.0641414, 60.2587886 ], [ 25.0641474, 60.2587661 ],
        [ 25.0641623, 60.2587445 ], [ 25.0641853, 60.2587249 ], [ 25.0642155, 60.2587078 ], [ 25.064252, 60.258694 ],
        [ 25.064245, 60.2585758 ], [ 25.06423, 60.2584329 ], [ 25.06420811544818, 60.25822472023811 ],
        [ 25.0642023, 60.2581694 ], [ 25.0641798, 60.2579546 ], [ 25.0642202, 60.2578063 ], [ 25.0641992, 60.2571467 ],
        [ 25.064098, 60.2565109 ], [ 25.0640129, 60.2563679 ], [ 25.0638865, 60.2557935 ], [ 25.0638206, 60.2557225 ],
        [ 25.0637859, 60.2557173 ], [ 25.063754, 60.2557088 ], [ 25.063726, 60.2556974 ], [ 25.0637031, 60.2556835 ],
        [ 25.063686, 60.2556677 ], [ 25.0636755, 60.2556505 ], [ 25.0636719, 60.2556326 ], [ 25.0636755, 60.2556147 ],
        [ 25.063686, 60.2555976 ], [ 25.0637031, 60.2555817 ], [ 25.063726, 60.2555678 ], [ 25.063754, 60.2555564 ],
        [ 25.0638071, 60.2554967 ], [ 25.0638104, 60.2554795 ], [ 25.0638263, 60.2553959 ],
        [ 25.0637166211509, 60.25510388197638 ], [ 25.0636829, 60.2550141 ], [ 25.0635894, 60.2547064 ],
        [ 25.0632281, 60.2535421 ], [ 25.0631441, 60.2533176 ], [ 25.0629996, 60.2531064 ], [ 25.0628783, 60.2529193 ],
        [ 25.0627468, 60.2527272 ], [ 25.0626278, 60.2525835 ], [ 25.0625221, 60.2524679 ],
        [ 25.062343119906608, 60.25228513966093 ], [ 25.0621528, 60.2520908 ], [ 25.0619805, 60.2519245 ],
        [ 25.0619071, 60.251831 ], [ 25.0618308, 60.2517595 ], [ 25.0614233, 60.2513916 ], [ 25.0609438, 60.2509675 ],
        [ 25.060261, 60.2503503 ], [ 25.059793, 60.2499353 ], [ 25.0595402, 60.24972 ], [ 25.0593645, 60.2495582 ],
        [ 25.0590499, 60.2492729 ], [ 25.0588884, 60.2491232 ], [ 25.0586913, 60.248959 ], [ 25.0582848, 60.2486615 ],
        [ 25.0580367, 60.2485039 ], [ 25.0577558, 60.2483495 ], [ 25.0572994, 60.2481201 ], [ 25.0571112, 60.2480423 ],
        [ 25.0569169, 60.2479693 ], [ 25.0564425, 60.2478219 ], [ 25.055820667770245, 60.247649568425 ],
        [ 25.0558114, 60.247647 ], [ 25.0554958, 60.2475699 ], [ 25.0554436, 60.2475585 ], [ 25.0552484, 60.247516 ],
        [ 25.055112, 60.2474871 ], [ 25.0538006, 60.247207 ], [ 25.0534636, 60.2471056 ], [ 25.052044, 60.2468064 ],
        [ 25.0517192, 60.2467357 ], [ 25.0510553, 60.2466338 ], [ 25.0505736, 60.2465308 ], [ 25.0494942, 60.24629 ],
        [ 25.0492508, 60.2462345 ], [ 25.0491003, 60.246201 ], [ 25.04888782639691, 60.246131240310035 ],
        [ 25.0488143, 60.2461071 ], [ 25.0484853, 60.2460309 ], [ 25.0481272, 60.2459516 ], [ 25.046768, 60.2456685 ],
        [ 25.0461572, 60.2455856 ], [ 25.0457328, 60.2455268 ], [ 25.0454554, 60.2454783 ], [ 25.0453088, 60.2454527 ],
        [ 25.0450203, 60.2453922 ], [ 25.044682122325476, 60.24532092084656 ], [ 25.0445321, 60.2452893 ],
        [ 25.044335, 60.2452468 ], [ 25.0441998, 60.2452125 ], [ 25.04384, 60.2451003 ], [ 25.0434434, 60.2449746 ],
        [ 25.0425552, 60.2447851 ], [ 25.0414607, 60.2445595 ], [ 25.0411219, 60.2445149 ], [ 25.0408944, 60.2444704 ],
        [ 25.04012216559721, 60.244311397924854 ], [ 25.0398162, 60.2442484 ], [ 25.0396007, 60.2442054 ],
        [ 25.0395533, 60.2441959 ], [ 25.0392939, 60.2441575 ], [ 25.0387934, 60.2440775 ], [ 25.0383489, 60.2440475 ],
        [ 25.0379811, 60.2440389 ], [ 25.0374487, 60.244049 ], [ 25.0370353, 60.2440568 ], [ 25.036217, 60.2440851 ],
        [ 25.0360571, 60.2440815 ], [ 25.035796, 60.2440751 ], [ 25.035566, 60.2440605 ], [ 25.0352172, 60.2440227 ],
        [ 25.0350155, 60.2439999 ], [ 25.0346544, 60.2439419 ], [ 25.034436687598333, 60.243896431808004 ],
        [ 25.0344102, 60.2438909 ], [ 25.0341397, 60.2438254 ], [ 25.0339458, 60.2437727 ], [ 25.0335969, 60.2436666 ],
        [ 25.0332455, 60.2435618 ], [ 25.0327412, 60.2434201 ], [ 25.0325334, 60.2433551 ], [ 25.0323568, 60.2433034 ],
        [ 25.0322991, 60.2432782 ], [ 25.0320555, 60.2431785 ], [ 25.0310725, 60.2429023 ], [ 25.0305614, 60.2427643 ],
        [ 25.0300741, 60.2426229 ], [ 25.0298624, 60.2425705 ], [ 25.0296282, 60.2425211 ], [ 25.0293549, 60.2424671 ],
        [ 25.0291891, 60.2424471 ], [ 25.0289468, 60.2424281 ], [ 25.0286992, 60.242421 ], [ 25.0284133, 60.2424563 ],
        [ 25.0282854, 60.2424657 ], [ 25.0282241, 60.242471 ], [ 25.0281644, 60.2424762 ], [ 25.0279938, 60.2424649 ],
        [ 25.0278333, 60.2424881 ], [ 25.02769677518484, 60.24251230171508 ], [ 25.0275315, 60.2425416 ],
        [ 25.0273089, 60.2425946 ], [ 25.0272, 60.242632 ], [ 25.0268597, 60.242768 ], [ 25.0265337, 60.2429143 ],
        [ 25.0261185, 60.2431374 ], [ 25.025852, 60.2432862 ], [ 25.0257599, 60.2433898 ], [ 25.0256432, 60.2434337 ],
        [ 25.025534, 60.2434452 ], [ 25.025314, 60.2435392 ], [ 25.0250831, 60.2436257 ], [ 25.0248718, 60.243697 ],
        [ 25.0247439, 60.2437713 ], [ 25.0245571, 60.2438214 ], [ 25.0244849, 60.2438394 ], [ 25.0242832, 60.2438465 ],
        [ 25.0240915, 60.2438884 ], [ 25.0237382, 60.2439495 ], [ 25.0234249, 60.2439864 ], [ 25.0231903, 60.2440027 ],
        [ 25.0229342, 60.2440141 ], [ 25.0226252, 60.2440169 ], [ 25.0224306, 60.244012 ], [ 25.0222518, 60.2440035 ],
        [ 25.0220072, 60.2439758 ], [ 25.0217897, 60.2439395 ], [ 25.0215614, 60.2438954 ], [ 25.0214013, 60.2438518 ],
        [ 25.0212605, 60.2438082 ], [ 25.0211233, 60.2437557 ], [ 25.020961, 60.2436828 ], [ 25.020725, 60.243607 ],
        [ 25.0206319, 60.2435543 ], [ 25.0204879, 60.243423 ], [ 25.0203712, 60.243282 ], [ 25.0202725, 60.243168 ],
        [ 25.0202184, 60.2430688 ], [ 25.0201654, 60.2429589 ], [ 25.0201293, 60.2428197 ], [ 25.0201209, 60.2427158 ],
        [ 25.020134696814484, 60.24261847835271 ], [ 25.0201413, 60.2425719 ], [ 25.0200672, 60.2423789 ],
        [ 25.0200517, 60.2423326 ], [ 25.0200345, 60.2422747 ], [ 25.0200129, 60.2421989 ], [ 25.0200043, 60.2421688 ],
        [ 25.019961, 60.2420497 ], [ 25.0199428, 60.2419867 ], [ 25.0199368, 60.2419429 ], [ 25.0199669, 60.2416763 ],
        [ 25.0200196, 60.241378 ], [ 25.020035, 60.2412854 ], [ 25.0200639, 60.2411928 ], [ 25.0201385, 60.2410554 ],
        [ 25.0202017, 60.2409608 ], [ 25.0203606, 60.240735 ], [ 25.0204272, 60.2406444 ], [ 25.0204866, 60.2405623 ],
        [ 25.0206515, 60.240331 ], [ 25.0207201, 60.2402246 ], [ 25.0207654, 60.2401391 ], [ 25.0208626, 60.2399434 ],
        [ 25.0209301, 60.2397356 ], [ 25.0209549, 60.239562 ], [ 25.0209673, 60.239356 ], [ 25.0209692, 60.2392261 ],
        [ 25.0209704, 60.2391559 ], [ 25.0209751, 60.2388896 ], [ 25.0210212, 60.2386164 ],
        [ 25.021033246910154, 60.238591968415854 ], [ 25.0211282, 60.2383994 ], [ 25.0212757, 60.238223 ],
        [ 25.0213974, 60.2380811 ], [ 25.0217017, 60.2377097 ], [ 25.0219468, 60.2372788 ], [ 25.0220226, 60.2370487 ],
        [ 25.0220441, 60.2369356 ], [ 25.0220522, 60.236893 ], [ 25.0220811, 60.2366642 ], [ 25.0220751, 60.2365491 ],
        [ 25.0220681, 60.2364146 ], [ 25.0220439, 60.2363332 ], [ 25.0219076, 60.236021 ],
        [ 25.021874601847102, 60.23596471608659 ], [ 25.02177, 60.2357863 ], [ 25.0216884, 60.2356686 ],
        [ 25.0215917, 60.2355717 ], [ 25.0213682, 60.2354289 ], [ 25.0212071, 60.2353252 ], [ 25.0209549, 60.2352064 ],
        [ 25.0207938, 60.2351368 ], [ 25.0205163, 60.2350541 ], [ 25.0203631, 60.2350173 ], [ 25.0200159, 60.2349224 ],
        [ 25.0186185, 60.2347209 ], [ 25.0175564, 60.2345488 ], [ 25.0170816, 60.2344684 ], [ 25.0165602, 60.2343633 ],
        [ 25.0161863, 60.2342772 ], [ 25.0157339, 60.234149 ], [ 25.0153457, 60.2340208 ], [ 25.0149366, 60.233879 ],
        [ 25.0146205, 60.2337587 ], [ 25.0145094, 60.2337563 ], [ 25.014343, 60.2336935 ], [ 25.0141766, 60.2336279 ],
        [ 25.0140429, 60.2335398 ], [ 25.0136852, 60.2334051 ], [ 25.0131398, 60.2331932 ], [ 25.0129392, 60.233112 ],
        [ 25.01255569012375, 60.23292240700481 ], [ 25.0125312, 60.2329103 ], [ 25.0120458, 60.2326882 ],
        [ 25.0119489, 60.23264 ], [ 25.0117998, 60.2325547 ], [ 25.0116598, 60.232474 ], [ 25.0109573, 60.2320379 ],
        [ 25.0106072, 60.2317947 ], [ 25.0103605, 60.2315972 ], [ 25.0101615, 60.2314215 ], [ 25.0100678, 60.2312829 ],
        [ 25.0099817, 60.2311081 ], [ 25.0099243, 60.230941 ], [ 25.009888, 60.2307833 ],
        [ 25.00988282174588, 60.23068845340669 ], [ 25.0098782, 60.2306038 ], [ 25.0098717, 60.2305363 ],
        [ 25.0098767, 60.2304761 ], [ 25.0098784, 60.2304387 ], [ 25.0099029, 60.2303142 ], [ 25.0099267, 60.2302382 ],
        [ 25.0099569, 60.2301732 ], [ 25.0099951, 60.2300947 ], [ 25.0101455, 60.2298984 ], [ 25.0103012, 60.2297633 ],
        [ 25.0104735, 60.2296313 ], [ 25.0107224, 60.2294572 ], [ 25.0105946, 60.22942 ],
        [ 25.01003153099357, 60.22924887172136 ], [ 25.0095667, 60.2291076 ], [ 25.0090084, 60.2289631 ],
        [ 25.0086096, 60.2288808 ], [ 25.0079347, 60.2287683 ], [ 25.0071175, 60.2286647 ], [ 25.0062978, 60.2285836 ],
        [ 25.0057928, 60.2285182 ], [ 25.0054795, 60.2284776 ], [ 25.0046049, 60.2283352 ], [ 25.0033903, 60.2281052 ],
        [ 25.003133, 60.2280356 ], [ 25.002219, 60.2277884 ], [ 25.0015002, 60.2276114 ], [ 25.0009516, 60.2274496 ],
        [ 25.0004528, 60.2272866 ], [ 24.9996505, 60.2270161 ], [ 24.9984749, 60.2265627 ], [ 24.9972578, 60.2260166 ],
        [ 24.9970407, 60.2259192 ], [ 24.9959448, 60.2254274 ], [ 24.9949921, 60.2250182 ], [ 24.9944856, 60.2248136 ],
        [ 24.9933098, 60.2243746 ], [ 24.9927605, 60.2241871 ], [ 24.9922111, 60.2240123 ], [ 24.9912592, 60.2237416 ],
        [ 24.9900692, 60.2234409 ], [ 24.9889679, 60.2231794 ], [ 24.9884223, 60.2230526 ], [ 24.9868575, 60.2227138 ],
        [ 24.9862248, 60.2225644 ], [ 24.9853097, 60.222333 ], [ 24.9850099, 60.2222572 ], [ 24.9843318, 60.2220696 ],
        [ 24.9836568, 60.2218661 ], [ 24.9830559, 60.2216658 ], [ 24.9825942, 60.2214948 ], [ 24.9821537, 60.2213342 ],
        [ 24.981569, 60.2210988 ], [ 24.9808512, 60.2207849 ], [ 24.9798909, 60.2203135 ], [ 24.9787524, 60.2197016 ],
        [ 24.9781843, 60.219356 ], [ 24.977947, 60.2192134 ], [ 24.9775639, 60.2189957 ], [ 24.9765716, 60.2183909 ],
        [ 24.9756057, 60.217757 ], [ 24.9753746, 60.2176141 ], [ 24.9749023, 60.2172498 ], [ 24.9742782, 60.216708 ],
        [ 24.9741274, 60.2165495 ], [ 24.974047, 60.2164651 ], [ 24.9737654, 60.21619 ], [ 24.9734913, 60.2159201 ],
        [ 24.9729102, 60.2153394 ], [ 24.9722246, 60.214645 ], [ 24.9708623, 60.2132812 ], [ 24.9704212, 60.212836 ],
        [ 24.970339808173218, 60.212757129995886 ], [ 24.9702921, 60.2127109 ], [ 24.9702309, 60.2126465 ],
        [ 24.9700494, 60.212449 ], [ 24.9697776, 60.2121533 ], [ 24.9688228, 60.2110054 ], [ 24.9686592, 60.2107965 ],
        [ 24.9686068, 60.2107228 ], [ 24.9685507, 60.2105795 ], [ 24.9685244, 60.2104055 ], [ 24.9685236, 60.2103494 ],
        [ 24.9685144, 60.2097136 ], [ 24.96849, 60.2095798 ], [ 24.9684375, 60.2093944 ], [ 24.9683457, 60.209114 ],
        [ 24.9683311, 60.2090623 ], [ 24.9682858, 60.2089312 ], [ 24.9682558, 60.2088445 ], [ 24.9679315, 60.2078497 ],
        [ 24.9679024, 60.2077468 ], [ 24.9677184, 60.2073234 ], [ 24.9675832, 60.2070123 ],
        [ 24.967576488468804, 60.20699543542999 ], [ 24.9674697, 60.2067271 ], [ 24.9673053, 60.2063999 ],
        [ 24.9669512, 60.2057668 ], [ 24.9667319, 60.2054213 ], [ 24.9667072, 60.2053824 ], [ 24.966613, 60.2052299 ],
        [ 24.9665143, 60.2050724 ], [ 24.9663316, 60.2047847 ], [ 24.9661254, 60.2044843 ], [ 24.9658235, 60.2041054 ],
        [ 24.965693070453113, 60.20395135003286 ], [ 24.9656722, 60.2039267 ], [ 24.965614, 60.2038597 ],
        [ 24.9655692, 60.2038107 ], [ 24.9653311, 60.2035506 ], [ 24.9650815, 60.203278 ], [ 24.9648565, 60.2030712 ],
        [ 24.9644652, 60.2027572 ], [ 24.9642038, 60.2025649 ], [ 24.9639994, 60.2024171 ], [ 24.9638105, 60.2022807 ],
        [ 24.9634565, 60.2019822 ], [ 24.9633659, 60.2019058 ], [ 24.963091, 60.2016625 ], [ 24.9628944, 60.2014647 ],
        [ 24.9626947, 60.2012468 ], [ 24.9625076, 60.2010337 ], [ 24.9623264, 60.2007946 ], [ 24.9621704, 60.2005579 ],
        [ 24.9620628, 60.2003749 ], [ 24.9619706, 60.2001911 ], [ 24.9618764, 60.1999706 ], [ 24.9618017, 60.1997605 ],
        [ 24.9617051, 60.1994698 ], [ 24.961647, 60.1992164 ], [ 24.9616057, 60.1989496 ], [ 24.9616035, 60.198916 ],
        [ 24.9615975, 60.1987694 ], [ 24.9615995, 60.198615 ], [ 24.9616203, 60.1983349 ], [ 24.9616303, 60.1982649 ],
        [ 24.961638049178216, 60.198212500794924 ], [ 24.9616429, 60.1981797 ], [ 24.9616925, 60.1979578 ],
        [ 24.9617908, 60.1976497 ], [ 24.9618163, 60.1975791 ], [ 24.961852, 60.1975009 ], [ 24.9619942, 60.1971935 ],
        [ 24.9620667, 60.1970355 ], [ 24.9621737, 60.1968102 ], [ 24.9621956, 60.1967597 ], [ 24.9623673, 60.1963909 ],
        [ 24.9625544, 60.1960085 ], [ 24.9625966, 60.1959157 ], [ 24.962756272889163, 60.195561437800734 ],
        [ 24.9627626, 60.1955474 ], [ 24.9629223, 60.1952075 ], [ 24.9630236, 60.1950401 ], [ 24.9636542, 60.1942989 ],
        [ 24.963934, 60.193965 ], [ 24.9642312, 60.1936104 ], [ 24.9642894, 60.1935315 ], [ 24.9643138, 60.1934984 ],
        [ 24.964367, 60.1933796 ], [ 24.9644949, 60.1930535 ], [ 24.964508, 60.1930204 ], [ 24.9645347, 60.1928952 ],
        [ 24.9645186, 60.1924311 ], [ 24.9645041, 60.192012 ], [ 24.9644998, 60.1919504 ], [ 24.9644869, 60.1917559 ],
        [ 24.964486845890907, 60.191755046190345 ], [ 24.9644801, 60.1916486 ], [ 24.9644189, 60.1905879 ],
        [ 24.9643814, 60.1904135 ], [ 24.9642824, 60.1900242 ], [ 24.9642492, 60.1899365 ], [ 24.9642006, 60.189795 ],
        [ 24.9641745, 60.1897377 ], [ 24.9641185, 60.1896146 ], [ 24.9640667, 60.1894785 ], [ 24.9639891, 60.1892993 ],
        [ 24.9639566, 60.1892423 ], [ 24.9639157, 60.1891825 ], [ 24.9638765, 60.1890992 ], [ 24.9638614, 60.1890685 ],
        [ 24.9637616, 60.1888791 ], [ 24.9635322, 60.1884607 ], [ 24.9634531, 60.1883442 ], [ 24.9633271, 60.1882376 ],
        [ 24.9631749, 60.1881318 ], [ 24.9630613, 60.1880753 ], [ 24.9629433, 60.1880208 ], [ 24.9627831, 60.1879635 ],
        [ 24.9626184, 60.1879126 ], [ 24.9623897, 60.1878515 ], [ 24.9622655, 60.1878226 ], [ 24.9621067, 60.1877854 ],
        [ 24.961949, 60.1877432 ], [ 24.9619042, 60.1877216 ], [ 24.9618098, 60.187674 ], [ 24.9617094, 60.1876054 ],
        [ 24.9615448, 60.1874366 ], [ 24.9614996, 60.1873866 ], [ 24.9614183, 60.1872702 ], [ 24.9613678, 60.187171 ],
        [ 24.9613355, 60.1870082 ], [ 24.9612978, 60.1868418 ], [ 24.96128857975799, 60.18680036129869 ],
        [ 24.961245, 60.1866045 ], [ 24.9611456, 60.1861579 ], [ 24.9611217, 60.1860924 ], [ 24.9610723, 60.1859851 ],
        [ 24.9610207, 60.1857887 ], [ 24.9609902, 60.1856743 ], [ 24.9609444, 60.1855685 ], [ 24.9608843, 60.1854479 ],
        [ 24.9607897, 60.1852997 ], [ 24.960641, 60.1851281 ], [ 24.9605674, 60.185048 ], [ 24.9604973, 60.1849897 ],
        [ 24.9602907, 60.1848186 ], [ 24.9601603, 60.1847118 ], [ 24.9600998, 60.1846609 ], [ 24.9600076, 60.1845835 ],
        [ 24.9599195, 60.1845165 ], [ 24.9588928, 60.1837255 ], [ 24.9583203, 60.1833154 ], [ 24.9582475, 60.1832722 ],
        [ 24.958036, 60.1831674 ], [ 24.9572784, 60.182806 ], [ 24.9572261, 60.1827792 ], [ 24.9571712, 60.1827513 ],
        [ 24.9569268, 60.1826274 ], [ 24.9566627, 60.1824974 ], [ 24.9563325, 60.1823314 ], [ 24.9562716, 60.1823011 ],
        [ 24.9560998, 60.1822204 ], [ 24.9559799, 60.1821654 ], [ 24.9558562, 60.1821083 ], [ 24.9556928, 60.1820439 ],
        [ 24.95482922016658, 60.18172675899993 ], [ 24.9547392, 60.1816937 ], [ 24.9546616, 60.1816657 ],
        [ 24.9545611, 60.1816286 ], [ 24.9544381, 60.1815811 ], [ 24.9542384, 60.1815096 ], [ 24.9531381, 60.1811145 ],
        [ 24.9530315, 60.1810722 ], [ 24.9528513, 60.1810083 ], [ 24.9523925, 60.1808399 ], [ 24.9516448, 60.1805656 ],
        [ 24.9515949, 60.1805473 ], [ 24.9513408, 60.1804552 ], [ 24.9511322, 60.1803808 ], [ 24.9510808, 60.1803605 ],
        [ 24.9502553, 60.1800562 ], [ 24.9501476, 60.1800072 ], [ 24.9500983, 60.1799799 ], [ 24.9500634, 60.1799587 ],
        [ 24.9500245, 60.1799249 ], [ 24.9499594, 60.1798752 ], [ 24.949896, 60.1798208 ], [ 24.9498536, 60.1797558 ],
        [ 24.9498391, 60.1796939 ], [ 24.9498564, 60.1795201 ], [ 24.94990384048385, 60.179043169812566 ],
        [ 24.949909, 60.1789913 ], [ 24.9499389, 60.1786547 ], [ 24.9499599, 60.1784737 ], [ 24.9499645, 60.1784206 ],
        [ 24.9499686, 60.1783722 ], [ 24.9499598, 60.1782109 ], [ 24.9499447, 60.1781596 ], [ 24.9499381, 60.1780838 ],
        [ 24.9499395, 60.1780095 ], [ 24.9499474, 60.1779017 ], [ 24.9500078, 60.1773762 ], [ 24.9500461, 60.1770185 ],
        [ 24.9500501, 60.1769503 ], [ 24.950055, 60.1768782 ], [ 24.9500761, 60.1766887 ], [ 24.9500827, 60.1766282 ],
        [ 24.9501321, 60.1761175 ], [ 24.9501385, 60.1760508 ], [ 24.9501409, 60.1760009 ], [ 24.9501401, 60.1759043 ],
        [ 24.9501421, 60.1758079 ], [ 24.9501404, 60.1757118 ], [ 24.9501437, 60.1756746 ], [ 24.950253, 60.1745976 ],
        [ 24.9502519, 60.1745361 ], [ 24.9502434, 60.1744934 ], [ 24.950211, 60.1744438 ], [ 24.9501496, 60.1743812 ],
        [ 24.9500952, 60.1743115 ], [ 24.9500066, 60.1742768 ], [ 24.9499424, 60.174258 ], [ 24.9498836, 60.1742345 ],
        [ 24.9498128, 60.1742026 ], [ 24.9497419, 60.1741601 ], [ 24.9496878, 60.1741151 ], [ 24.9496468, 60.1740627 ],
        [ 24.9496376, 60.1740098 ], [ 24.9495657, 60.17385 ], [ 24.9495636, 60.1738125 ], [ 24.9495466, 60.1737774 ],
        [ 24.9494385, 60.1736704 ], [ 24.94923855618267, 60.173495540486186 ], [ 24.949028, 60.1733114 ],
        [ 24.9489668, 60.1732528 ], [ 24.9488575, 60.1731225 ], [ 24.9487469, 60.1729862 ], [ 24.94858, 60.1728163 ],
        [ 24.9485085, 60.1727544 ], [ 24.948411, 60.1726666 ], [ 24.9479694, 60.1722771 ], [ 24.9478762, 60.1722093 ],
        [ 24.9478108, 60.1721724 ], [ 24.9476983, 60.1721223 ], [ 24.9475991, 60.1721027 ], [ 24.9474457, 60.1720942 ],
        [ 24.947299, 60.1720906 ], [ 24.9472154, 60.1720881 ], [ 24.9454761, 60.172035 ], [ 24.9453761, 60.172032 ],
        [ 24.9452234, 60.1720279 ], [ 24.9451136, 60.1720255 ], [ 24.9450279, 60.1720198 ], [ 24.9449401, 60.172012 ],
        [ 24.9447626, 60.1719925 ], [ 24.944583, 60.1719605 ], [ 24.9445179, 60.1719489 ], [ 24.9443378, 60.1719283 ],
        [ 24.9442025, 60.1719134 ], [ 24.943762716814053, 60.1718991949298 ] ],
      "stops": [
        { "gtfsId": "HSL:1402125", "name": "Tapuliaukio", "lat": 60.275230300000004, "lon": 25.03528299999997 },
        { "gtfsId": "HSL:1402152", "name": "Hatuntekijänkuja", "lat": 60.27689419999989, "lon": 25.034724899999922 },
        { "gtfsId": "HSL:1411131", "name": "Terrintie", "lat": 60.276165700000206, "lon": 25.04112950000005 },
        { "gtfsId": "HSL:1411128", "name": "Puistolan tori", "lat": 60.274409900000066, "lon": 25.044193599999957 },
        { "gtfsId": "HSL:1411110", "name": "Karrintie", "lat": 60.271284699999654, "lon": 25.046552000000062 },
        { "gtfsId": "HSL:1411125", "name": "Puistolan kirkko", "lat": 60.270669999999654, "lon": 25.053233900000063 },
        { "gtfsId": "HSL:1411123", "name": "Puistolan VPK", "lat": 60.27005720000012, "lon": 25.058740200000045 },
        { "gtfsId": "HSL:1412120", "name": "Nummitie", "lat": 60.26953409999965, "lon": 25.064445200000062 },
        { "gtfsId": "HSL:1412118", "name": "Heikinlaakso", "lat": 60.269613499999934, "lon": 25.07268110000009 },
        { "gtfsId": "HSL:1412133", "name": "Kalliotie", "lat": 60.26665289999995, "lon": 25.071235899999973 },
        { "gtfsId": "HSL:1413117", "name": "Suurmetsäntie", "lat": 60.26267569999979, "lon": 25.06826389999989 },
        { "gtfsId": "HSL:1413115", "name": "Tattarisuontie", "lat": 60.25822880000025, "lon": 25.064050400000017 },
        { "gtfsId": "HSL:1413118", "name": "Hevosmiehenkatu", "lat": 60.255113, "lon": 25.063618 },
        { "gtfsId": "HSL:1413113", "name": "Jarrutie", "lat": 60.25230600000003, "lon": 25.062256599999998 },
        { "gtfsId": "HSL:1385162", "name": "Harkkoraudantie", "lat": 60.247706500000255, "lon": 25.055756600000016 },
        { "gtfsId": "HSL:1385152", "name": "Kankiraudantie", "lat": 60.24619570000026, "lon": 25.048801900000015 },
        { "gtfsId": "HSL:1385150", "name": "Malmin lentoasema", "lat": 60.24537539999976, "lon": 25.044635499999977 },
        { "gtfsId": "HSL:1385148", "name": "Valuraudantie", "lat": 60.24436159999976, "lon": 25.040080199999977 },
        { "gtfsId": "HSL:1382148", "name": "Usvatie", "lat": 60.24394559999997, "lon": 25.034395000000035 },
        { "gtfsId": "HSL:1382146", "name": "Raetie", "lat": 60.24257709999966, "lon": 25.027743399999792 },
        { "gtfsId": "HSL:1382144", "name": "Latokartanontie", "lat": 60.24261330000003, "lon": 25.019986399999997 },
        { "gtfsId": "HSL:1383114", "name": "Seppämestarintie", "lat": 60.238576299999956, "lon": 25.020904300000034 },
        { "gtfsId": "HSL:1383112", "name": "Malmin hautausmaa", "lat": 60.235983700000205, "lon": 25.02174319999989 },
        { "gtfsId": "HSL:1383110", "name": "Meripihkatie", "lat": 60.233011799999765, "lon": 25.012376399999976 },
        { "gtfsId": "HSL:1383108", "name": "Pihlajistontie", "lat": 60.23069040000019, "lon": 25.0097381999999 },
        { "gtfsId": "HSL:1363101", "name": "Viikki", "lat": 60.229294000000046, "lon": 25.009975900000022 },
        { "gtfsId": "HSL:1240123", "name": "Valtimontie", "lat": 60.21279370000036, "lon": 24.97019620000012 },
        { "gtfsId": "HSL:1240106", "name": "Sumatrantie", "lat": 60.207015499999756, "lon": 24.96737239999997 },
        { "gtfsId": "HSL:1240118", "name": "Kumpulan kampus", "lat": 60.2039941999996, "lon": 24.965488099999856 },
        { "gtfsId": "HSL:1220127", "name": "Paavalin kirkko", "lat": 60.198205099999974, "lon": 24.961435400000028 },
        { "gtfsId": "HSL:1220104", "name": "Vallilan varikko", "lat": 60.19554800000023, "lon": 24.962635600000027 },
        { "gtfsId": "HSL:1220102", "name": "Ristikkokatu", "lat": 60.191757499999945, "lon": 24.964357400000033 },
        { "gtfsId": "HSL:1113131", "name": "Sörnäinen(M)", "lat": 60.186807399999935, "lon": 24.961160700000136 },
        { "gtfsId": "HSL:1112126", "name": "Haapaniemi", "lat": 60.1817704, "lon": 24.954764399999924 },
        { "gtfsId": "HSL:1111114", "name": "Hakaniemi", "lat": 60.179039899999985, "lon": 24.949770900000082 },
        { "gtfsId": "HSL:1020106", "name": "Kaisaniemenpuisto", "lat": 60.17354089999973, "lon": 24.94907820000002 },
        { "gtfsId": "HSL:1020201", "name": "Rautatientori", "lat": 60.17192, "lon": 24.94376 }
      ]
    }
  }
}
`;

  describe('#parseHSLRealTimeData', function () {
    it('should return a valid trip data object', function () {
      var d = NetworkHandler.parseHSLRealTimeData(HSLData);
      assert.deepEqual(d,testTripData);
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

  describe('#getHSLTripData', function (done) {
    beforeEach(function () {
      requests = [];
      xhr = sinon.useFakeXMLHttpRequest();
      global.XMLHttpRequest = xhr;
      xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };

    });

    afterEach(function () {
      xhr.restore();
      requests = [];
    });

    it.skip('description', function (done) {
      var r = NetworkHandler.getHSLTripData(testTripData);
      requests[0].respond(200, { "Content-Type": "application/json"}, GraphQLResponse);
      r.should.eventually.deepEqual("this should fail").and.notify(done);
    });
  });

  describe('#getHSLRealTimeAPIData', function () {

    beforeEach(function () {
      requests = [];
      xhr = sinon.useFakeXMLHttpRequest();
      global.XMLHttpRequest = xhr;
      xhr.onCreate = function (xhr) {
        requests.push(xhr);
      };

    });

    afterEach(function () {
      xhr.restore();
      requests = [];
    });

    it('should return valid data with valid request', function (done) {
      var r = NetworkHandler.getHSLRealTimeAPIData("GET", "http://dev.hsl.fi/hfp/journey/bus/1213/");
      requests[0].respond(200, { "Content-Type": "application/json"}, HSLData);
      r.should.eventually.deep.equal(HSLData).and.notify(done);
    });

    it('should handle 404', function (done) {
      var r = NetworkHandler.getHSLRealTimeAPIData("GET", "http://dev.hsl.fi/hfp/journey/bus/1213/");
      requests[0].respond(404, { "Content-Type": "application/html"}, "nopenopenope");
      r.should.eventually.be.rejectedWith(Error).and.notify(done);
    });
  });

});
