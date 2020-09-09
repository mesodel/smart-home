const { Room } = require("../models/models");

const room = {
  create: async (room) => {
    try {
      let createdRoom = await Room.create(room);
      return createdRoom;
    } catch (err) {
      throw new Error(err.message);
    }
  },
  getAll: async () => {
    try {
      return await Room.findAll();
    } catch (err) {
      throw new Error(err.message);
    }
  },
  createOrGetRoomByName: async (room) => {
    try {
      let result = await Room.findOrCreate({ where: { name: room.name } });
      return result;
    } catch (err) {
      console.log(err);
      console.log("error encountered in create or get");
      return null;
    }
  },
};

module.exports = room;
