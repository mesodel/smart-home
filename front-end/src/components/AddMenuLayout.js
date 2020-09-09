import TempAndHumidity from "../images/TempAndHumidity.jpg";
import {
  MenuItem,
  ListItem,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
} from "@material-ui/core";
import React from "react";
import Button from "@material-ui/core/Button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import { mdiWaterPercent } from "@mdi/js";
import Icon from "@mdi/react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

class AddMenuLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connectDevice: null,
      isAlertDialogOpen: false,
      isDialogOpen: false,
      connectingStatus: null,
      shouldLoadingAppear: false,
      comboBoxValue: "",
      encodedComboBoxValue: "",
    };
  }

  pairSensor = () => {
    this.setState({ shouldLoadingAppear: false });
    this.handleAlertDialogState();
    this.props.handleSuccessSnackbarState();
    this.handleOnDeviceConnected();
  };

  handleAlertDialogState = (ev) => {
    this.setState({
      isAlertDialogOpen: !this.state.isAlertDialogOpen,
    });
  };

  handleDialogState = (ev) => {
    this.setState({
      isDialogOpen: !this.state.isDialogOpen,
    });
  };

  handleOnDeviceConnected = () => {
    let device = this.state.connectDevice;
    let roomName = this.state.comboBoxValue;
    this.props.onDeviceConnected(device, roomName);
  };

  render() {
    let filter = createFilterOptions();
    let comboBox = (
      <Autocomplete
        id="comboBox"
        options={this.props.roomList}
        inputValue={this.state.comboBoxValue}
        onInputChange={(ev, newValue) => {
          this.setState({ comboBoxValue: newValue });
          let encodedRoomName = newValue.replace(/\s/g, "%20");
          this.setState({
            encodedComboBoxValue: encodedRoomName,
          });
        }}
        getOptionLabel={(option) => {
          return option.inputValue ? option.inputValue : option.name;
        }}
        renderOption={(option) => option.name}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              name: `Add ${params.inputValue}`,
            });
          }
          return filtered;
        }}
        selectOnFocus
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="Select a room" variant="outlined" />
        )}
      />
    );

    let circularDialog = this.state.shouldLoadingAppear ? (
      <CircularProgress disableShrink />
    ) : (
      <span></span>
    );
    let devicesList = this.props.devices;
    let deviceAvatar;
    let newDevicesList = [];
    if (devicesList.length > 0) {
      for (let i = 0; i < devicesList.length; i++) {
        let device = devicesList[i];
        if (device.type === "temperature") {
          deviceAvatar = (
            <ListItemAvatar>
              <Avatar>
                <WbSunnyIcon />
              </Avatar>
            </ListItemAvatar>
          );
        } else if (device.type === "humidity") {
          deviceAvatar = (
            <ListItemAvatar>
              <Avatar>
                <Icon path={mdiWaterPercent} size={1} />
              </Avatar>
            </ListItemAvatar>
          );
        } else if (device.type === "temperature&humidity") {
          deviceAvatar = (
            <ListItemAvatar>
              <Avatar>
                {/* <Icon path={TempAndHumidity}> */}
                <img
                  src={TempAndHumidity}
                  style={{ width: 36, height: 36 }}
                  alt="tempAndHumidityIcon"
                />
                {/* </Icon> */}
              </Avatar>
            </ListItemAvatar>
          );
        }
        newDevicesList.push(
          <ListItem
            button
            key={i + "devices"}
            onClick={(ev) => {
              this.handleAlertDialogState(ev);
              this.setState({
                connectDevice: device,
              });
            }}
          >
            {deviceAvatar}
            <ListItemText
              primary={device.name}
              secondary={device.type + " Sensor"}
            />
          </ListItem>
        );
      }
    }

    return (
      <div>
        <MenuItem style={{ opacity: 0.95 }} disabled={true}>
          What do you want to add?
        </MenuItem>
        <div id="buttons">
          <Button
            color="primary"
            style={{ left: "35%", right: "35%" }}
            onClick={(ev) => {
              this.handleDialogState(ev);
              this.props.handleAddClose(ev);
            }}
          >
            Device
          </Button>
        </div>

        <div id="addBluetoothDeviceDialog">
          <Dialog
            open={this.state.isDialogOpen}
            onClose={this.handleDialogState}
          >
            <DialogTitle style={{ marginLeft: "auto", marginRight: "auto" }}>
              Available Sensors
            </DialogTitle>
            <DialogContent>
              <List>
                {newDevicesList}
                <CircularProgress
                  style={{ marginLeft: "40%", marginRight: "40%" }}
                />
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                style={{ marginRight: "auto", marginLeft: "auto" }}
                color="primary"
                onClick={(ev) => {
                  this.handleDialogState(ev);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <div id="alertDialog">
          <Dialog
            open={this.state.isAlertDialogOpen}
            onClose={this.handleAlertDialogState}
          >
            <DialogTitle>{"Are you sure you want to pair?"}</DialogTitle>
            <DialogContent>
              {comboBox}
              <Button
                color="primary"
                autoFocus
                style={{ left: "30px" }}
                onClick={(ev) => {
                  ev.preventDefault();
                  this.handleDialogState(ev);
                  this.setState({ shouldLoadingAppear: true });
                  this.pairSensor();
                }}
              >
                Yes
              </Button>
              <Button
                color="primary"
                autoFocus
                style={{ left: "110px" }}
                onClick={(ev) => {
                  this.handleAlertDialogState(ev);
                }}
              >
                No
              </Button>
              {circularDialog}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default AddMenuLayout;
