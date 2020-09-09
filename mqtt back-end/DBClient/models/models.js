const Sequelize = require("sequelize");

const sequelize = new Sequelize("ThesisDB", "root", "pass", {
  dialect: "mysql",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((err) => {
    console.log(`Database connection error: ${err}`);
  });

class Record extends Sequelize.Model {}
Record.init(
  {
    recordId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: Sequelize.INTEGER,
      validate: {
        max: 100,
        min: -20,
      },
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: Sequelize.DATE,
  },
  {
    sequelize,
    modelName: "record",
    timestamps: false,
  }
);

class Sensor extends Sequelize.Model {}
Sensor.init(
  {
    address: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "sensor",
    timestamps: false,
  }
);

Sensor.hasMany(Record);
Record.belongsTo(Sensor);

class Room extends Sequelize.Model {}
Room.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "room",
    timestamps: false,
  }
);

Room.hasMany(Sensor);
Sensor.belongsTo(Room);

sequelize.sync();

module.exports = { sequelize, Sensor, Room, Record };
