global.WebSocket = require("ws");
const paho = require("paho-mqtt");
let { search, pairDevice, bluetooth } = require("./modules/bluetoothBluez");
let { retrieveDataFromSensor } = require("./modules/bluetoothSerialPort");
const { exec } = require("child_process");
const address = require("../server_info.json").address;

let client = new paho.Client(address, 9001, "BluetoothClient");

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

client.connect({
  onSuccess: onConnect,
  userName: "username",
  password: "pass",
});

function onConnect() {
  console.log("succesfully connected");
  client.subscribe("pairBt");
  client.subscribe("forceSearch");

  client.subscribe("sensorsList");

  // set a timer so each 2 mins new search will be performed
  setInterval(() => {
    initSearch();
  }, 120000);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  if (message.destinationName == "sensorsList") {
    handleReinit(JSON.parse(message.payloadString));
  } else if (message.destinationName == "pairBt") {
    try {
      let payload = JSON.parse(message.payloadString);
      handlePairBt(payload);
    } catch (err) {
      console.log("err on parsing json");
    }
  } else if (message.destinationName == "forceSearch") {
    handleForceSearch();
  }
}

function handleReinit(sensors) {
  console.log("repairing to all sensors currently in db");
  for (let i = 0; i < sensors.length; i++) {
    pairToDevice(sensors[i]);
  }
  client.unsubscribe("sensorsList");
  console.log("reinit all sensors");
}

function handleForceSearch() {
  console.log("will force refresh");
  initSearch();
}

function pairToDevice(sensor) {
  pairDevice(sensor.address);

  // this is done in order to remove the sensor from the list of foundDevices
  initSearch();

  setInterval(() => {
    retrieveDataFromSensor(sensor.address, sensor.type)
      .then((data) => {
        console.log("sending data on topic: Sensor Data " + sensor.address);
        client.publish("Sensor Data " + sensor.address, JSON.stringify(data));
      })
      .catch((err) => {
        console.log(err);
      });
  }, 60000);
}

function handlePairBt(payload) {
  try {
    pairToDevice(payload.sensor);
    client.publish("createSensor", JSON.stringify(payload));
  } catch (err) {
    console.log(err);
    console.log("err on pair bt");
  }
}

function initSearch() {
  exec("sudo service bluetooth restart", (err, stdout, stderr) => {
    if (err) {
      console.log("error while restarting bluetooth");
      console.log(err);
    } else {
      console.log("restarted bluetooth service successfully");
    }
  });

  setTimeout(async () => {
    await bluetooth.registerDummyAgent();
    console.log("agent re registerd");

    let foundDevices = await search();
    client.publish("foundDevices", JSON.stringify(foundDevices), 0, true);
  }, 3000);
}
