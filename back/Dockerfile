FROM	alpine:latest

RUN	apk update && \
	apk add mosquitto mosquitto-clients

COPY	./back/mosquitto.conf /etc/mosquitto/mosquitto.conf
	
USER	mosquitto

EXPOSE	1883 9001

CMD mosquitto -c /etc/mosquitto/mosquitto.conf
