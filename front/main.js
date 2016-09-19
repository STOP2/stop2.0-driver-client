var client = mqtt.connect("wss://test.mosca.io") // you add a ws:// url here

client.subscribe("mqtt/demo")

client.on("message", function (topic, payload) {
  alert([topic, payload].join(": "))
  client.end()
})

//client.publish("mqtt/demo", "hello world!")
