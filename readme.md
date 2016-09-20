[![Build Status](https://travis-ci.org/STOP2/stop2.0-driver-client.svg?branch=master)](https://travis-ci.org/STOP2/stop2.0-driver-client)

# Kuljettajasoftaproto

- `back`-kansio - Docker-köntti joka toimittaa dataa frontille
- `front`-kansio - JavaScript-prototyyppi frontista

## front

- `browserMqtt.js` - Webpackilla selainkäyttöön paketoitu node-moduuli MQTT.js
- `index.js` - Varsinainen koodi

### Käyttöohje
- Asenna `npm`
- `npm install http-server -g`
- `http-server`
- Mene IP:hen `http://127.0.0.1:8080/`

## back

Docker-kontti, jossa on mosquitto, joka kuuntelee porteilla 1883 (MQTT) ja 9001 (websocket).

Käyttö:

```
docker build -t mosquitto .
docker run -p 1883:1883 -p 9001:9001 mosquitto
```
