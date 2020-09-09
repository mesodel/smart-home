# Smart Home Solution

- [Smart Home Solution](#smart-home-solution)
  - [Introduction](#introduction)
  - [Hardware used](#hardware-used)
  - [Setup](#setup)
  - [Features](#features)

## Introduction

This project presents a highly modular IoT monitoring system that is easily expandable being able to auto-generate views based on the sensor type.

## Hardware used

- Arduino UNO
- DHT11 Temperature and Humidity Sensor
- HC-05 Bluetooth module
- Raspberry Pi 4

## Setup

- Backend requirements:
  - system running Linux
  - libglib2.0-dev package
  - libdbus-1-dev package
  - Node.JS Carbon LTS
  - MySQL daemon running
- Frontend requirements
  - Node.JS Carbon LTS or higher

To run locally, just run `npm install` in the `front-end` and `mqtt back-end` directories.

An MQTT broker can be used either locally, or cloud hosted.

## Features

- connect to any number of sensors without having to alter the code
- seamlessly reconnect to any previously connected sensor
- wireless exchange of data from the node to the gateway using bluetooth serial port communication
- exchange of data between the gateway and the broker using the lightweight MQTT protocol
