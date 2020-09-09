import React from "react";
import appWallpaper from "../images/rubber_fig.jpg";
import { Helmet } from "react-helmet";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";

class DefaultLayout extends React.Component {
  render() {
    let sensors = [];
    if (this.props.sensorsList) {
      sensors = this.props.sensorsList.map((sensor) => {
        let sensorName = sensor.name;
        if (sensorName[0] >= "0" && sensorName[0] <= "9") {
          sensorName = sensorName.substr(2);
        }
        return (
          <TableRow>
            <TableCell
              style={{ fontWeight: "bold", color: "darkslategray" }}
              align="center"
            >
              {sensorName}
            </TableCell>
            <TableCell
              style={{ fontWeight: "bold", color: "darkslategray" }}
              align="center"
            >
              {sensor.address}
            </TableCell>
          </TableRow>
        );
      });
    }

    return (
      <div
        style={{
          backgroundImage: `url(${appWallpaper})`,
          width: "100vw",
          height: "100vh",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          marginTop: "-64px",
        }}
      >
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <div
          style={{
            width: "45%",
            height: "30%",
            position: "absolute",
            top: "124px",
            right: "80px",
            backgroundColor: "lightgray",
            opacity: 0.7,
            borderRadius: "15px",
            filter: "blur(2x)",
            WebkitFilter: "blur(2px)",
          }}
        ></div>
        <TableContainer
          style={{
            position: "absolute",
            top: "124px",
            right: "80px",
            width: "45%",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  style={{ color: "darkslategray", fontWeight: "bold" }}
                >
                  Name
                </TableCell>
                <TableCell
                  align="center"
                  style={{ color: "darkslategray", fontWeight: "bold" }}
                >
                  Address
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{sensors}</TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

export default DefaultLayout;
