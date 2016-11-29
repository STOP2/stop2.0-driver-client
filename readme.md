[![Build Status](https://travis-ci.org/STOP2/stop2.0-driver-client.svg?branch=master)](https://travis-ci.org/STOP2/stop2.0-driver-client)

# Driver Client prototype

The JavaScript version is the initial prototype of the driver client. Currently it can be used to visualize a vehicle's trip and to track stop requests. However it has no connection to the bus' hardware.

The more recent Python version can be found here: https://github.com/STOP2/stop2-rpi

The project consists of two parts:

- `back` folder - Docker-module for providing data to frontend
- `front` folder - frontend JavaScript prototype

## front

Code is in the `src` folder:
- `Main.js` - Entrypoint
- `NetworkHandler.js` - Connection to the MQTT broker, STOP2 and HSL APIs
- `UI.js` - User interface
- `Geometry.js` - Calculates the vehicle's position
- `Trip.js` - Trip object (contains the list of stops & other data)
- `Logger.js` - Error and debug logging logic

### Development workflow

In the root of the `front` folder, run the following commands:
- `npm install` - Install dependencies
- `webpack` - Bundle all of the code and the dependencies into a single JavaScript file, `dist/bundle.js`. Remember to run this every time you edit the files

### Usage
- Open `index.html`

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
