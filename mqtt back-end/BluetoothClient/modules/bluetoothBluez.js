const Bluez = require("bluez");

const bluetooth = new Bluez();

let adapter;
let foundDevices = [];

const search = () => {
  return new Promise(async (resolve, reject) => {
    foundDevices = [];
    await adapter.StartDiscovery();
    console.log("started scanning");

    setTimeout(() => {
      adapter.StopDiscovery();
      console.log("stopped scanning");
      foundDevices = foundDevices.map((device) => {
        if (device && device.Name) {
          let type = parseInt(device.Name[0]);
          switch (type) {
            case 0:
              type = "temperature";
              break;
            case 1:
              type = "humidity";
              break;
            case 2:
              type = "temperature&humidity";
              break;
          }

          return {
            name: device.Name,
            address: device.Address,
            type: type,
          };
        }
      });

      resolve(foundDevices);
    }, 10000);
  });
};

const pairDevice = async (address) => {
  let device = await bluetooth.getDevice(address);
  let paired = await device.Paired();
  if (!paired) {
    device.Pair();
    console.log("pairing successful for " + address);
  } else {
    console.log(address + " is already paired");
  }
};

bluetooth.on("device", async (address, props) => {
  if (props.Name && props.Name.includes("Sensor")) {
    let device = await bluetooth.getDevice(address);
    let paired = await device.Paired();
    if (!paired) {
      foundDevices.push(props);
    }
  }
});

bluetooth.init().then(async () => {
  // listen on first bluetooth adapter
  adapter = await bluetooth.getAdapter("hci0");
});

module.exports = {
  search,
  pairDevice,
  bluetooth,
};
