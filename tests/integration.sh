#!/bin/sh -

mosquitto -c /etc/mosquitto/mosquitto.conf &

sleep 1
netstat -l | egrep '(1883|9001)'
MSG="Hello, world!"
sleep 3 && /usr/bin/mosquitto_pub -t testchannel -m "$MSG" &
RES=`/usr/bin/mosquitto_sub -C 1 -t testchannel`
if [ "$RES" = "$MSG" ]; then
	echo "Mosquitto is up and running."
	exit 0
else
	echo "Mosquitto doesn't seem to be up."
	exit 1
fi
