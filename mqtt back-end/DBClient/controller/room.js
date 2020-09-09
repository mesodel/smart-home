const service = require("../service/room");
const sensorService = require("../service/sensor");

async function handleCreateRoom(client, room) {
  try {
    let createdRoom = await service.create(room);
    await publishAllRooms(client);
    return createdRoom;
  } catch (err) {
    console.log(err);
  }
}

async function publishAllRooms(client) {
  try {
    let rooms = await service.getAll();
    for (let i = 0; i < rooms.length; i++) {
      let sensors = await sensorService.getByRoom(rooms[i].id);

      // this is done in order to stringify the object
      rooms[i].dataValues.sensors = sensors;
    }
    rooms = JSON.stringify(rooms);
    client.publish("roomsList", rooms, 0, true);
  } catch (err) {
    console.log("err in controller");
  }
}

module.exports = {
  handleCreateRoom,
  publishAllRooms,
};
