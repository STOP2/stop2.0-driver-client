// MQTT

var client = mqtt.connect("ws://192.168.99.100:9001");

client.on('connect', function () {
  console.log("Connected");
  client.subscribe('presence');
  client.publish('presence', 'Hello mqtt');
})

client.on("message", function (topic, payload) {
  console.log([topic, payload].join(": "))
  addStop(topic,payload);
  client.end()
})

// UI-päivitys

var currentStop;
var emptyButton = document.querySelector(".stop-empty-button");
emptyButton.addEventListener("click", function() {
  // Lähetä tieto siitä ettei pysäkillä ollut ketään
});

var stopList = document.querySelector(".stop-list");

function addStop(topic,payload) {
  var item = document.createElement("li");
  var node = document.createTextNode(payload);
  item.appendChild(node);
  stopList.appendChild(item);
}
