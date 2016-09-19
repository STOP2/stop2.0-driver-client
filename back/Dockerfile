FROM	alpine:latest

RUN	apk update && \
	apk add mosquitto

COPY	mosquitto.conf /etc/mosquitto/mosquitto.conf
	
USER	mosquitto

CMD mosquitto -c /etc/mosquitto/mosquitto.conf
