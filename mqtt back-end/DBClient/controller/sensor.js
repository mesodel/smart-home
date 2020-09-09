const service = require("../service/sensor");
const roomService = require("../service/room");
const { publishAllRooms } = require("./room");

async function handleCreateSensor(client, sensor, room) {
  try {
    let resultArray = await roomService.createOrGetRoomByName(room);
    let retrievedRoom = resultArray[0];
    let createdSensor = await service.create(sensor, retrievedRoom.id);

    await publishSensors(client);

    if (resultArray[1]) {
      console.log("will have to publish the rooms");
      await publishAllRooms(client);
    }

    console.log("sensor created successfully");

    return createdSensor;
  } catch (err) {
    console.log(err);

    console.log("error while creating sensor");
  }
}

async function publishSensors(client) {
  try {
    let sensors = await service.getAll();
    sensors = JSON.stringify(sensors);
    client.publish("sensorsList", sensors, 0, true);
  } catch (err) {
    console.log("err on publish sensors");
  }
}

module.exports = {
  handleCreateSensor,
  publishSensors,
};
