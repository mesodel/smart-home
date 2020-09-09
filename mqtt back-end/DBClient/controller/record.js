const service = require("../service/record");

async function handleCreateRecord(client, record, sensorAddress) {
  try {
    let keysArray = Object.keys(record);
    for (let i = 0; i < keysArray.length; i++) {
      let type = keysArray[i]; // temperature
      let value = record[type]; // record[temperature] = 23

      let rValue = {
        value: value, // 23
        type: type, // temperature
      };

      await service.create(rValue, sensorAddress);
    }

    await publishRecords(client, sensorAddress);
    await publishRecordsForToday(client, sensorAddress);
    await publishRecordForLast7Days(client, sensorAddress);
  } catch (err) {
    console.log("err in create record");
    console.log(err);
  }
}

async function publishRecords(client, address) {
  try {
    let records = await service.getAllSensorValues(address);
    records = JSON.stringify(records);
    client.publish("Records All " + address, records, 0, true);
    console.log("published Records All " + address);
  } catch (err) {
    console.log("error while publishing all records");
    console.log(err);
  }
}

async function publishRecordsForToday(client, address) {
  try {
    let recordsForToday = await service.getSensorValuesForToday(address);
    recordsForToday = JSON.stringify(recordsForToday);
    client.publish("Records 24Hrs " + address, recordsForToday, 0, true);
    console.log("published Records 24Hrs " + address);
  } catch (err) {
    console.log("err while publishing records for today");
    console.log(err);
  }
}

async function publishRecordForLast7Days(client, address) {
  try {
    let recordsForLast7Days = await service.getSensorValuesForLastWeek(address);
    recordsForLast7Days = JSON.stringify(recordsForLast7Days);
    client.publish("Records 7Days " + address, recordsForLast7Days, 0, true);
    console.log("published Records 7Days " + address);
  } catch (err) {
    console.log("err while publishing records for last 7 days");
    console.log(err);
  }
}

module.exports = {
  handleCreateRecord,
  publishRecords,
  publishRecordsForToday,
  publishRecordForLast7Days,
};
