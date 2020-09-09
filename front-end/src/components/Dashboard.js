import React from "react";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import { AppBar, Toolbar, Menu, MenuItem } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import DrawerLayout from "./DrawerLayout";
import AddMenuLayout from "./AddMenuLayout";
import AddIcon from "@material-ui/icons/Add";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import paho from "paho-mqtt";
import DefaultLayout from "./DefaultLayout";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myClient: null,
      temperatureSensors: [],
      humiditySensors: [],
      roomList: [],
      devices: [],
      isDrawerOpen: false,
      isMenuOpen: false,
      isAddOpen: false,
      isSuccessSnackBarOpen: false,
      isFailSnackBarOpen: false,
      anchorElMenu: null,
      anchorElAdd: null,
      sensorsList: null,
      componentToBeDisplayed: null,
    };
  }

  componentDidMount = () => {
    let client = new paho.Client("13.58.107.50", 9001, "client front end");
    this.setState({ myClient: client });
    let onConnect = () => {
      console.log("connected");
      client.subscribe("roomsList");
      client.subscribe("sensorsList");
      client.subscribe("foundDevices");
    };
    client.connect({
      onSuccess: onConnect,
      userName: "username",
      password: "pass",
    });

    this.setState({
      componentToBeDisplayed: (
        <DefaultLayout sensorsList={this.state.sensorsList} />
      ),
    });

    client.onMessageArrived = (message) => {
      if (message.destinationName === "roomsList") {
        try {
          let rooms = JSON.parse(message.payloadString);
          for (let i = 0; i < rooms.length; i++) {
            let sensors = rooms[i].sensors;
            for (let j = 0; j < sensors.length; j++) {
              sensors[i].name = sensors[i].name.substr(2);
            }
          }
          this.setState({ roomList: rooms });
        } catch (err) {
          console.log("err on getting room list from db");
        }
      }
      if (message.destinationName === "sensorsList") {
        try {
          let sensors = JSON.parse(message.payloadString);
          this.setState({ sensorsList: sensors });
          this.setState({
            componentToBeDisplayed: (
              <DefaultLayout sensorsList={this.state.sensorsList} />
            ),
          });

          let temps = [];
          let humids = [];

          if (sensors) {
            for (let i = 0; i < sensors.length; i++) {
              if (sensors[i].type.includes("temperature", 0)) {
                sensors[i].name = sensors[i].name.substr(1);
                temps.push(sensors[i]);
              }
              if (sensors[i].type.includes("humidity", 0)) {
                sensors[i].name = sensors[i].name.substr(1);
                humids.push(sensors[i]);
              }
            }
          }
          this.setState({ temperatureSensors: temps, humiditySensors: humids });
        } catch (err) {
          console.log("error while getting sensors");
          console.log(err);
        }
      }
      if (message.destinationName === "foundDevices") {
        try {
          let foundDevices = JSON.parse(message.payloadString);
          this.setState({ devices: foundDevices });
        } catch (err) {
          console.log("error on getting devices");
        }
      }
    };

    client.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
      }
    };
  };

  onDeviceConnected = (device, roomName) => {
    let bluetoothDevice = {
      room: {
        name: roomName,
      },
      sensor: device,
    };
    let string = JSON.stringify(bluetoothDevice);
    this.state.myClient.publish("pairBt", string);
  };

  changeComponentToBeDisplayed = (component) => {
    this.setState({ componentToBeDisplayed: component });
  };

  handleDrawerState = (event) => {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen,
    });
  };

  handleMenuState = (event) => {
    this.setState({
      isMenuOpen: !this.state.isMenuOpen,
    });
  };

  handleAddState = (event) => {
    this.setState({
      isAddOpen: !this.state.isAddOpen,
    });
  };

  handleSuccessSnackbarState = (event) => {
    this.setState({
      isSuccessSnackBarOpen: !this.state.isSuccessSnackBarOpen,
    });
  };

  handleFailSnackbarState = (event) => {
    this.setState({
      isFailSnackBarOpen: !this.state.isFailSnackBarOpen,
    });
  };

  toggleAnchorElMenu = (event) => {
    if (this.state.anchorElMenu) this.setState({ anchorElMenu: null });
    else this.setState({ anchorElMenu: event.currentTarget });
  };

  toggleAnchorElAdd = (event) => {
    if (this.state.anchorElAdd) this.setState({ anchorElAdd: null });
    else this.setState({ anchorElAdd: event.currentTarget });
  };

  handleMenuClose = (event) => {
    this.handleMenuState();
    this.toggleAnchorElMenu(event);
  };

  handleAddClose = (event) => {
    this.handleAddState();
    this.toggleAnchorElAdd(event);
  };

  render() {
    let failAlert = (
      <MuiAlert elevation={6} variant="filled" severity="error">
        Failed pairing device!
      </MuiAlert>
    );
    let successAlert = (
      <MuiAlert elevation={6} variant="filled" severity="success">
        Pairing successful!
      </MuiAlert>
    );

    const theme = createMuiTheme({
      overrides: {
        MuiDrawer: {
          paper: {
            background: "#f2f1f0",
          },
        },
      },
    });

    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "lightgray",
        }}
      >
        <div id="appBar" style={{ backgroundColor: "lightslategray" }}>
          <AppBar position="sticky" color="transparent">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={this.handleDrawerState}
              >
                <MenuIcon />
              </IconButton>

              <IconButton
                color="inherit"
                style={{
                  fontSize: "large",
                  position: "absolute",
                  right: "8px",
                }}
                onClick={(ev) => {
                  this.toggleAnchorElAdd(ev);
                  this.handleAddState(ev);
                }}
              >
                <AddIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        </div>

        <ThemeProvider theme={theme}>
          <Drawer
            id="drawer"
            open={this.state.isDrawerOpen}
            docked="false"
            onClose={(ev) => {
              this.handleDrawerState(ev);
            }}
          >
            <DrawerLayout
              sensorsList={this.state.sensorsList}
              client={this.state.myClient}
              roomList={this.state.roomList}
              temperatureSensors={this.state.temperatureSensors}
              humiditySensors={this.state.humiditySensors}
              changeComponentToBeDisplayed={this.changeComponentToBeDisplayed}
              handleDrawerState={this.handleDrawerState}
            />
          </Drawer>
        </ThemeProvider>

        <div id="menus">
          <Menu
            anchorEl={this.state.anchorElMenu}
            onClose={this.handleMenuClose}
            open={this.state.isMenuOpen}
          >
            <MenuItem onClick={this.handleMenuClose}>Edit</MenuItem>
          </Menu>
          <Menu
            anchorEl={this.state.anchorElAdd}
            onClose={this.handleAddClose}
            open={this.state.isAddOpen}
            keepMounted
          >
            <AddMenuLayout
              handleAddClose={this.handleAddClose}
              handleSuccessSnackbarState={this.handleSuccessSnackbarState}
              handleFailSnackbarState={this.handleFailSnackbarState}
              onDeviceConnected={this.onDeviceConnected}
              roomList={this.state.roomList}
              devices={this.state.devices}
            />
          </Menu>
        </div>

        <Snackbar
          id="success"
          open={this.state.isSuccessSnackBarOpen}
          autoHideDuration={6000}
          onClose={this.handleSuccessSnackbarState}
        >
          {successAlert}
        </Snackbar>
        <Snackbar
          id="fail"
          open={this.state.isFailSnackBarOpen}
          autoHideDuration={6000}
          onClose={this.handleFailSnackbarState}
        >
          {failAlert}
        </Snackbar>
        {this.state.componentToBeDisplayed}
      </div>
    );
  }
}

export default Dashboard;
