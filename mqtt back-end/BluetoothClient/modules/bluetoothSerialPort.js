const BluetoothSerialPort = require("bluetooth-serial-port")
  .BluetoothSerialPort;

const serial = new BluetoothSerialPort();

const retrieveDataFromSensor = async (address, request) => {
  return new Promise((resolve, reject) => {
    serial.findSerialPortChannel(address, (channel) => {
      serial.connect(address, channel, () => {
        console.log("connected successfully");
        serial.write(Buffer.from(request, "utf-8"), (err) => {});
        let result = "";
        serial.on("data", (buffer) => {
          console.log("data received");
          result += buffer.toString("utf-8");
          if (result[result.length - 1] == "}") {
            serial.close();
            serial.removeAllListeners("data");
            result = JSON.parse(result);
            resolve(result);
          }
        });
      });
    });
  });
};

module.exports = {
  retrieveDataFromSensor,
};
