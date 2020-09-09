const { Sensor } = require("../models/models");

const sensor = {
  create: async (sensor, roomId) => {
    try {
      let createdSensor = Sensor.build(sensor);
      createdSensor.roomId = roomId;

      await createdSensor.save();

      return createdSensor;
    } catch (err) {
      throw new Error(err.message);
    }
  },
  getAll: async () => {
    try {
      return await Sensor.findAll();
    } catch (err) {
      throw new Error(err.message);
    }
  },
  getByRoom: async (roomId) => {
    try {
      return await Sensor.findAll({
        where: {
          roomId: roomId,
        },
      });
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

module.exports = sensor;
