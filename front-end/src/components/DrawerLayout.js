import React from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  List,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import HomeIcon from "@material-ui/icons/Home";
import Icon from "@mdi/react";
import { mdiWaterPercent } from "@mdi/js";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import TemperatureLayout from "./TemperatureLayout";
import HumidityLayout from "./HumidityLayout";
import DefaultLayout from "./DefaultLayout";

class DrawerLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTemperatureNestedListOpen: false,
      isHumidityNestedListOpen: false,
      isRoomsNestedListOpen: false,
      renderNeeded: "no",
      isDialogOpen: false,
    };
  }
  handleRoomsNestedListState = (event) => {
    let roomList = this.props.roomList;
    for (let i = 0; i < roomList.length; i++) {
      roomList[i].isDropDownOpen = false;
    }
    this.setState({
      isRoomsNestedListOpen: !this.state.isRoomsNestedListOpen,
    });
  };

  handleTemperatureNestedListState = (event) => {
    this.setState({
      isTemperatureNestedListOpen: !this.state.isTemperatureNestedListOpen,
    });
  };

  handleHumidityNestedListState = (event) => {
    this.setState({
      isHumidityNestedListOpen: !this.state.isHumidityNestedListOpen,
    });
  };

  handleDialogState = () => {
    this.setState({
      isDialogOpen: !this.state.isDialogOpen,
    });
  };

  render() {
    let roomList;
    if (this.props.roomList.length === 0) {
      roomList = (
        <div>
          <ListItem>
            <ListItemText primary={"No rooms added"} />
          </ListItem>
          <div style={{ paddingLeft: "15%" }}>
            <Button
              variant={"contained"}
              style={{ size: "small" }}
              endIcon={<AddCircleIcon />}
            >
              Add room
            </Button>
          </div>
        </div>
      );
    } else {
      roomList = this.props.roomList.map((room, index) => {
        let sensorList;
        if (room.sensors.length === 0) {
          sensorList = (
            <ListItem>
              <ListItemText primary={"No sensors added to this room"} />
            </ListItem>
          );
        } else {
          sensorList = room.sensors.map((sensor, index) => {
            return (
              <div>
                <ListItem
                  button
                  key={"drawer " + index}
                  onClick={(ev) => {
                    this.handleDialogState(ev);
                  }}
                >
                  <ListItemText primary={sensor.name} />
                </ListItem>
                <Dialog
                  open={this.state.isDialogOpen}
                  onClose={this.handleDialogState}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle>
                    {"Choose what information to be displayed:"}
                  </DialogTitle>
                  <DialogActions>
                    <div>
                      <Button
                        color="primary"
                        onClick={(ev) => {
                          this.handleDialogState(ev);
                          this.props.handleDrawerState(ev);
                          this.props.changeComponentToBeDisplayed(
                            <TemperatureLayout
                              sensor={sensor}
                              myClient={this.props.client}
                            />
                          );
                        }}
                      >
                        Temperature
                      </Button>
                      <Button
                        color="primary"
                        autoFocus
                        onClick={(ev) => {
                          this.handleDialogState(ev);
                          this.props.handleDrawerState(ev);
                          this.props.changeComponentToBeDisplayed(
                            <HumidityLayout
                              sensor={sensor}
                              myClient={this.props.client}
                            />
                          );
                        }}
                      >
                        Humidity
                      </Button>
                    </div>
                  </DialogActions>
                </Dialog>
              </div>
            );
          });
        }
        return (
          <List component="div" style={{ paddingLeft: "25%" }}>
            <ListItem
              button
              key={"list " + index}
              onClick={(ev) => {
                this.setState({ renderNeeded: "yes" });
                room.isDropDownOpen = !room.isDropDownOpen;
              }}
            >
              <ListItemText primary={room.name} />
              {room.isDropDownOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={room.isDropDownOpen} timeout="auto" unmountOnExit>
              <List component="div" style={{ paddingLeft: "25%" }}>
                {sensorList}
              </List>
            </Collapse>
          </List>
        );
      });
    }

    let temperatureSensors;
    if (
      !this.props.temperatureSensors ||
      this.props.temperatureSensors.length === 0
    ) {
      temperatureSensors = (
        <div>
          <ListItem>
            <ListItemText primary={"No temperature sensors added"} />
          </ListItem>
          <div style={{ paddingLeft: "15%" }}>
            <Button
              variant={"contained"}
              style={{ size: "small" }}
              endIcon={<AddCircleIcon />}
            >
              Add sensor
            </Button>
          </div>
        </div>
      );
    } else {
      temperatureSensors = this.props.temperatureSensors.map(
        (sensor, index) => {
          return (
            <ListItem
              button
              key={"sensor " + index}
              onClick={(ev) => {
                this.props.handleDrawerState(ev);
                this.props.changeComponentToBeDisplayed(
                  <TemperatureLayout
                    sensor={sensor}
                    myClient={this.props.client}
                  />
                );
              }}
            >
              <ListItemText primary={sensor.name} />
            </ListItem>
          );
        }
      );
    }

    let humiditySensors;
    if (
      !this.props.humiditySensors ||
      this.props.humiditySensors.length === 0
    ) {
      humiditySensors = (
        <div>
          <ListItem>
            <ListItemText primary={"No humidity sensors added"} />
          </ListItem>
          <div style={{ paddingLeft: "15%" }}>
            <Button
              variant={"contained"}
              style={{ size: "small" }}
              endIcon={<AddCircleIcon />}
            >
              Add sensor
            </Button>
          </div>
        </div>
      );
    } else {
      humiditySensors = this.props.humiditySensors.map((sensor, index) => {
        return (
          <ListItem
            button
            key={index}
            onClick={(ev) => {
              this.props.handleDrawerState(ev);
              this.props.changeComponentToBeDisplayed(
                <HumidityLayout sensor={sensor} myClient={this.props.client} />
              );
            }}
          >
            <ListItemText primary={sensor.name} />
          </ListItem>
        );
      });
    }
    return (
      <List>
        <ListItem
          button
          onClick={() => {
            this.props.handleDrawerState();
            this.props.changeComponentToBeDisplayed(
              <DefaultLayout sensorsList={this.props.sensorsList} />
            );
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </ListItem>
        <Divider />
        <ListItem button onClick={this.handleTemperatureNestedListState}>
          <ListItemIcon>
            <WbSunnyIcon />
          </ListItemIcon>
          <ListItemText>Temperature Sensors</ListItemText>
          {this.state.isTemperatureNestedListOpen ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItem>
        <Collapse
          in={this.state.isTemperatureNestedListOpen}
          timeout="auto"
          unmountOnExit
        >
          <List component="div" style={{ paddingLeft: "25%" }}>
            {temperatureSensors}
          </List>
        </Collapse>
        <ListItem button onClick={this.handleHumidityNestedListState}>
          <ListItemIcon>
            <Icon path={mdiWaterPercent} size={1} />
          </ListItemIcon>
          <ListItemText>Humidity Sensors</ListItemText>
          {this.state.isHumidityNestedListOpen ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItem>
        <Collapse
          in={this.state.isHumidityNestedListOpen}
          timeout="auto"
          unmountOnExit
        >
          <List component="div" style={{ paddingLeft: "25%" }}>
            {humiditySensors}
          </List>
        </Collapse>
        <Divider />
        <ListItem button onClick={this.handleRoomsNestedListState}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>Rooms</ListItemText>
          {this.state.isRoomsNestedListOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse
          in={this.state.isRoomsNestedListOpen}
          timeout="auto"
          unmountOnExit
        >
          <List component="div" style={{ paddingLeft: "25%" }}>
            {roomList}
          </List>
        </Collapse>
      </List>
    );
  }
}

export default DrawerLayout;
