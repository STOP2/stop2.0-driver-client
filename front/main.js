// MQTT

var client = mqtt.connect("wss://192.168.99.100:9001") // you add a ws:// url here

client.subscribe("data")

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
