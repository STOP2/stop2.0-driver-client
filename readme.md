[![Build Status](https://travis-ci.org/STOP2/stop2.0-driver-client.svg?branch=master)](https://travis-ci.org/STOP2/stop2.0-driver-client)

# Driver Client prototype

- `back`-folder - Docker-module for providing data to frontend
- `front`-folder - frontend JavaScript prototype

## front

- `browserMqtt.js` - Webpack-packed MQTT.js for browser use
- `index.js` - Varsinainen koodi

### Usage
- Go to `/front/`
- Install `npm`
- `npm install http-server -g`
- `http-server`
- Go to `http://127.0.0.1:8080/`

## back

Docker-container with mosquitto listening to ports 1883 (MQTT) and 9001 (websocket).

### Usage

In the project directory:

```
docker build -t mosquitto -f back/Dockerfile .
docker run -p 1883:1883 -p 9001:9001 mosquitto
```

Tests can be run locally (inside Docker): 
```
docker run -t -v `pwd`:/build mosquitto /build/tests/integration.sh
```
