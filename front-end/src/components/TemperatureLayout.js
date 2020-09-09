import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import Card from "@material-ui/core/Card";
import {
  Table,
  CardContent,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableFooter,
  TablePagination,
} from "@material-ui/core";
import { Helmet } from "react-helmet";

class TemperatureLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 0,
      client: this.props.myClient,
      sensor: this.props.sensor,
      sensorDataToday: null,
      sensorData7Days: null,
      rawData7Days: null,
      time: "",
      dummy: true,
      intervalId: 0,
      rowsPerPage: 3,
      currPage: 0,
    };
  }

  addZeroes = (number) => {
    if (number > 9) {
      return number;
    } else {
      return "0" + number;
    }
  };

  formatDate = (rawDate) => {
    let date = new Date(rawDate);
    let formattedDate = `${this.addZeroes(date.getHours())}:${this.addZeroes(
      date.getMinutes()
    )} ${this.addZeroes(date.getDate())}/${this.addZeroes(
      date.getMonth() + 1
    )}/${date.getFullYear()}`;
    return formattedDate;
  };

  prepareRecordsForTable = (rawData, start, noRecords) => {
    let preparedRecords = [];
    if (!rawData) {
      return [];
    }

    for (let i = start * noRecords; i < rawData.length; i++) {
      if (rawData[i].type === "temperature") {
        let formattedDate = this.formatDate(rawData[i].date);
        let record = (
          <TableRow>
            <TableCell>{rawData[i].recordId}</TableCell>
            <TableCell align="center">{rawData[i].value}</TableCell>
            <TableCell align="right">{formattedDate}</TableCell>
          </TableRow>
        );
        preparedRecords.push(record);
        if (preparedRecords.length === noRecords) {
          break;
        }
      }
    }
    return preparedRecords;
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({
      currPage: 0,
      rowsPerPage: parseInt(event.target.value),
    });
  };

  prepareRecords24Hrs = (sensorRecords) => {
    let sensorData = [];

    // separates the record by type; eg extract temperature sensors
    for (let i = 0; i < sensorRecords.length; i++) {
      let record = sensorRecords[i];
      let hr = new Date(record.date).getUTCHours();

      if (record.type === "temperature") {
        let val = { value: record.value, date: hr };
        sensorData.push(val);
      }
    }

    // group the sensors together by hour
    let preparedElements = [];
    if (sensorData) {
      for (let i = 0; i < sensorData.length; i++) {
        let sensor = sensorData[i];
        if (!preparedElements[sensor.date]) {
          preparedElements[sensor.date] = [];
        }
        preparedElements[sensor.date].push(sensor.value);
      }
    }

    // performs a mean and preprocess the data to be fed to the pie
    let elementsForPie = [];
    for (let i = 0; i < preparedElements.length; i++) {
      if (preparedElements[i]) {
        let sum = 0;
        for (let j = 0; j < preparedElements[i].length; j++) {
          sum += preparedElements[i][j];
        }
        let avg = sum / preparedElements[i].length;
        avg = Math.floor(avg);
        let color;
        if (avg < 15) {
          color = "blue";
        } else if (avg < 30) {
          color = "YellowGreen";
        } else {
          color = "red";
        }
        elementsForPie.push({
          id: i.toString(),
          value: avg,
          label: "Hr " + this.addZeroes(i),
          color: color,
        });
      }
    }

    // set state
    this.setState({ sensorDataToday: elementsForPie });
  };

  prepareRecords7Days = (sensorRecords) => {
    let sensorData = [];

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let i = 0; i < sensorRecords.length; i++) {
      let record = sensorRecords[i];
      let recordDate = new Date(record.date);
      recordDate = new Date(recordDate - 3 * 60 * 60 * 1000);
      let date = recordDate.getDate() + " " + monthNames[recordDate.getMonth()];
      if (record.type === "temperature") {
        let val = { value: record.value, date: date };
        sensorData.push(val);
      }
    }

    let preparedElements = [];
    if (sensorData) {
      for (let i = 0; i < sensorData.length; i++) {
        let sensor = sensorData[i];
        if (!preparedElements[sensor.date]) {
          preparedElements[sensor.date] = [];
        }
        preparedElements[sensor.date].push(sensor.value);
      }
    }

    let keys = Object.keys(preparedElements);
    let elementsForChart = [];
    for (let i = 0; i < keys.length; i++) {
      let currElement = preparedElements[keys[i]];
      if (currElement) {
        let sum = 0;
        for (let j = 0; j < currElement.length; j++) {
          sum += currElement[j];
        }
        let avg = sum / currElement.length;
        avg = Math.floor(avg);
        elementsForChart.push({
          x: keys[i],
          y: avg,
        });
      }
    }

    let finalDataForChart = [
      {
        id: this.state.sensor.name.substring(2),
        color: "red",
        data: elementsForChart,
      },
    ];

    this.setState({ sensorData7Days: finalDataForChart });
    console.log(finalDataForChart);
  };

  componentDidMount = () => {
    let h = window.innerHeight - 80;
    h += "px";
    this.setState({ height: h });

    window.addEventListener("resize", () => {
      console.log(window.innerHeight);
      let h = window.innerHeight - 80;
      h += "px";
      this.setState({ height: h });
    });

    this.state.client.subscribe("Records 24Hrs " + this.state.sensor.address);
    this.state.client.subscribe("Records 7Days " + this.state.sensor.address);

    this.state.client.onMessageArrived = (message) => {
      if (
        message.destinationName ===
        "Records 24Hrs " + this.state.sensor.address
      ) {
        try {
          let sensorRecords = JSON.parse(message.payloadString);
          this.prepareRecords24Hrs(sensorRecords);
        } catch (err) {
          console.log("err on getting records 24Hrs");
        }
      }
      if (
        message.destinationName ===
        "Records 7Days " + this.state.sensor.address
      ) {
        try {
          let sensorRecords = JSON.parse(message.payloadString);
          this.setState({ rawData7Days: sensorRecords });
          this.prepareRecords7Days(sensorRecords);
        } catch (err) {
          console.log("err on getting records 7Days");
        }
      }
    };

    let intervalId = setInterval(() => {
      this.setState({ dummy: !this.state.dummy });
    }, 3000);
    this.setState({ intervalId: intervalId });
  };

  componentWillUnmount = () => {
    clearInterval(this.state.intervalId);
  };

  handleChangePage = (event, newPage) => {
    this.setState({ currPage: newPage });
  };

  render() {
    let today = new Date(Date.now());
    let options = { weekday: "long" };
    let dayOfWeek = new Intl.DateTimeFormat("en-US", options).format(today);
    let month = today.getMonth() + 1;
    let hour = today.getHours();
    let minute = today.getMinutes();
    let day = today.getDate();

    let formatText = (text) => {
      if (text < 10) {
        text = "0" + text;
      }
      return text;
    };

    let date =
      formatText(day) + "-" + formatText(month) + "-" + today.getFullYear();
    let time = formatText(hour) + " : " + formatText(minute);

    let hourRecord;
    let elementsForPie = [];
    if (this.state.sensorDataToday && this.state.sensorDataToday.length > 0) {
      hourRecord =
        this.state.sensorDataToday[this.state.sensorDataToday.length - 1]
          .value + "°C";
      elementsForPie = this.state.sensorDataToday;
    }

    let elementsForChart = [];
    if (this.state.sensorData7Days && this.state.sensorData7Days.length > 0) {
      elementsForChart = this.state.sensorData7Days;
    }

    return (
      <div
        id="fullScreen"
        style={{
          width: "100%",
          height: this.state.height,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Helmet>
          <title>{"Temperature - " + this.props.sensor.name}</title>
        </Helmet>
        <div
          id="firstRow"
          style={{
            width: "100%",
            height: "50%",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Card
            id="pieAndTitle"
            raised={true}
            style={{
              height: "87%",
              width: "47%",
              marginTop: "2.5%",
              marginLeft: "2.5%",
            }}
          >
            <CardContent
              style={{
                width: "96%",
                height: "97%",
                padding: "8px",
                position: "relative",
              }}
            >
              <ResponsivePie
                data={elementsForPie}
                padAngle={1}
                cornerRadius={12}
                colors={(bar) => {
                  return bar.color;
                }}
                borderWidth={1}
                enableRadialLabels={false}
                innerRadius={0.8}
              />
              <div
                style={{
                  position: "absolute",
                  display: "flex",
                  left: "35%",
                  top: "30%",
                  bottom: "30%",
                  right: "35%",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "5vh",
                  color: "#000000",
                  textAlign: "center",
                }}
              >
                <span style={{ marginTop: "10%", fontSize: "0.75em" }}>
                  {dayOfWeek}
                </span>
                <span style={{ fontSize: "0.6em" }}>{date}</span>
                <span style={{ fontSize: "0.75em" }}>{time}</span>
                <hr
                  style={{
                    width: "60%",
                    marginTop: "3%",
                    marginBottom: "3%",
                  }}
                />
                <span style={{ fontSize: "0.85em" }}>{hourRecord}</span>
              </div>
            </CardContent>
          </Card>
          <Card
            raised={true}
            style={{
              width: "47%",
              height: "87%",
              marginTop: "2.5%",
              marginRight: "2.5%",
              marginLeft: "3.5%",
            }}
          >
            <CardContent>
              <Typography
                style={{
                  fontSize: 18,
                  fontFamily: "verdana",
                  textAlign: "center",
                }}
              >
                Records for the past 7 days
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Record ID</TableCell>
                    <TableCell align="center">Value</TableCell>
                    <TableCell align="right">Date and Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.prepareRecordsForTable(
                    this.state.rawData7Days,
                    this.state.currPage,
                    this.state.rowsPerPage
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[3, 5]}
                      count={-1}
                      rowsPerPage={this.state.rowsPerPage}
                      page={this.state.currPage}
                      onChangePage={this.handleChangePage}
                      onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div
          id="secondRow"
          style={{
            height: "50%",
            width: "96%",
            marginTop: "2.5%",
            marginLeft: "2.5%",
            marginRight: "2.5%",
          }}
        >
          <Card
            raised={true}
            style={{
              width: "99%",
              height: "87%",
            }}
          >
            <CardContent style={{ width: "98%", height: "98%" }}>
              <ResponsiveLine
                data={elementsForChart}
                margin={{ top: 50, right: 76, bottom: 50, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  stacked: true,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}
export default TemperatureLayout;
