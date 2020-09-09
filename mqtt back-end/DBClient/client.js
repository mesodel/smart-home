global.WebSocket = require("ws");
const paho = require("paho-mqtt");

const roomController = require("./controller/room");
const sensorController = require("./controller/sensor");
const recordController = require("./controller/record");

const address = require("../server_info.json").address;

let client = new paho.Client(address, 9001, "DatabaseClient");

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.onConnected = onConnect;

let subscribedSensors = [];

client.connect({
  userName: "username",
  password: "pass",
});

function onConnect() {
  console.log("connected successfully");

  client.subscribe("createRoom");
  client.subscribe("createSensor");

  client.subscribe("sensorsList");

  roomController.publishAllRooms(client);
  sensorController.publishSensors(client);
}

// called when a message arrives
function onMessageArrived(message) {
  if (message.destinationName == "createRoom") {
    try {
      let room = JSON.parse(message.payloadString);
      roomController.handleCreateRoom(client, room);
    } catch (err) {
      console.log("err on json parse");
    }
  } else if (message.destinationName == "createSensor") {
    try {
      let payload = JSON.parse(message.payloadString);
      sensorController.handleCreateSensor(client, payload.sensor, payload.room);
    } catch (err) {
      console.log("err on json parse");
    }
  } else if (message.destinationName == "sensorsList") {
    try {
      let sensors = JSON.parse(message.payloadString);
      for (let i = 0; i < sensors.length; i++) {
        if (!subscribedSensors.includes(sensors[i].address)) {
          // adding the current sensor to the list of sensors already handled
          subscribedSensors.push(sensors[i].address);

          // subscribe so you wouldn't miss data
          client.subscribe("Sensor Data " + sensors[i].address);
          console.log("subscribing to Sensor Data " + sensors[i].address);

          // publish all topics for that sensor
          recordController.publishRecords(client, sensors[i].address);
          recordController.publishRecordsForToday(client, sensors[i].address);
          recordController.publishRecordForLast7Days(
            client,
            sensors[i].address
          );
        }
      }
    } catch (err) {
      console.log(err);
      console.log("err on sensors list topic");
    }
  } else if (message.destinationName.includes("Sensor Data")) {
    try {
      let address = message.destinationName.split("Sensor Data ")[1];
      console.log(
        "received data from sensor " +
          address +
          " and will proceed to insert into db"
      );
      let payload = JSON.parse(message.payloadString);
      recordController.handleCreateRecord(client, payload, address);
    } catch (err) {
      console.log("err on records publish");
      console.log(err);
    }
  }
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}
