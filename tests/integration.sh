#!/bin/sh -

MSG="Hello, world!"

sleep 2 && /usr/bin/mosquitto_pub -t testchannel -m "$MSG" &
RES=`/usr/bin/mosquitto_sub -C 1 -t testchannel`
if [ "$RES" = "$MSG" ]; then
	exit 0
else
	exit 1
fi
