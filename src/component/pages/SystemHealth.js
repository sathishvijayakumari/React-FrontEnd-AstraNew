import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import {
  irqSensor,
  employeeRegistration,
  masterGateway,
  signalRepeator,
  slaveGateway,
  tempertureSensor,
} from "../../urls/apis";

const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class SystemHealth extends Component {
  componentDidMount() {
    // linkClicked(5);
    this.masterHealth();
    this.slaveHealth();
    this.signalRepeatorHealth();
    this.sensorHealth();
    this.assetHealth();
    // timer function for refreshing each 10 seconds
    this.interval1 = setInterval(this.masterHealth, 15 * 1000);
    this.interval2 = setInterval(this.slaveHealth, 15 * 1000);
    this.interval3 = setInterval(this.signalRepeatorHealth, 15 * 1000);
    this.interval4 = setInterval(this.sensorHealth, 15 * 1000);
    this.interval5 = setInterval(this.assetHealth, 15 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval1);
    clearInterval(this.interval2);
    clearInterval(this.interval3);
    clearInterval(this.interval4);
    clearInterval(this.interval5);
  }

  /** Fetch health details of all master gateway registered */
  masterHealth = () => {
    axios({ method: "GET", url: masterGateway })
      .then((response) => {
        if (response.status === 200) {
          let master = response.data;
          $("#gatewayHealth").empty();
          // Displaying master gateway health details in table format
          if (master.length !== 0) {
            for (let i = 0; i < master.length; i++) {
              let timestamp =
                  master[i].lastseen.substr(0, 10) +
                  " " +
                  master[i].lastseen.substr(11, 8),
                status = "red";
              if (new Date() - new Date(master[i].lastseen) <= 2 * 60 * 1000) {
                status = "green";
              }
              $("#gatewayHealth").append(
                "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  master[i].gatewayid +
                  "</td><td>" +
                  master[i].floor.name +
                  "</td><td>" +
                  timestamp +
                  "</td><td>" +
                  "<div class='circle' style='margin:auto;background-color:" +
                  status +
                  ";'></div></td></tr>"
              );
            }
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 403) {
          $("#syshealth_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#sys-error").text(
            "Master Gateway : Request failed with status code " +
              error.response.status
          );
        }
      });
  };

  /** Fetch health details of all slave gateway registered */
  slaveHealth = () => {
    axios({ method: "GET", url: slaveGateway })
      .then((response) => {
        if (response.status === 200) {
          let slave = response.data;
          $("#slaveHealth").empty();
          if (slave.length !== 0) {
            for (let i = 0; i < slave.length; i++) {
              let timestamp =
                  slave[i].lastseen.substr(0, 10) +
                  " " +
                  slave[i].lastseen.substr(11, 8),
                status = "red";
              if (new Date() - new Date(slave[i].lastseen) <= 2 * 60 * 1000) {
                status = "green";
              }
              $("#slaveHealth").append(
                "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  slave[i].gatewayid +
                  "</td><td>" +
                  slave[i].master.floor.name +
                  "</td><td>" +
                  slave[i].master.gatewayid +
                  "</td><td>" +
                  timestamp +
                  "</td><td>" +
                  "<div class='circle' style='margin:auto;background-color:" +
                  status +
                  ";'></div></td></tr>"
              );
            }
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 403) {
          $("#syshealth_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#sys-error").text(
            "Slave Gateway : Request failed with status code " +
              error.response.status
          );
        }
      });
  };

  /** Fetch health details of all signal repeators registered */
  signalRepeatorHealth = () => {
    axios({ method: "GET", url: signalRepeator })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            $("#signalRepeaterHealth").empty();
            for (let i = 0; i < data.length; i++) {
              let timestamp =
                  data[i].lastseen.substr(0, 10) +
                  " " +
                  data[i].lastseen.substr(11, 8),
                status = "red";
              if (new Date() - new Date(data[i].lastseen) <= 2 * 60 * 1000) {
                status = "green";
              }
              $("#signalRepeaterHealth").append(
                "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].macid +
                  "</td><td>" +
                  timestamp +
                  "</td><td>" +
                  "<div class='circle' style='margin:auto;background-color:" +
                  status +
                  ";'></div></td></tr>"
              );
            }
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#syshealth_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#sys-error").text(
            "Signal Repeator : Request failed with status code " +
              error.response.status
          );
        }
      });
  };

  /** Fetch health details of all temperature humidity and irq sensors registered */
  sensorHealth = () => {
    $("#sensorHealth").empty();
    let count = 0;
    axios({ method: "GET", url: tempertureSensor })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              let timestamp =
                  data[i].lastseen.substr(0, 10) +
                  " " +
                  data[i].lastseen.substr(11, 8),
                status = "red";
              if (new Date() - new Date(data[i].lastseen) <= 2 * 60 * 1000) {
                status = "green";
              }
              $("#sensorHealth").append(
                "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].macid +
                  "</td><td>Temp/Humid Sensor</td><td>" +
                  data[i].battery +
                  "</td><td>" +
                  timestamp +
                  "</td><td>" +
                  "<div class='circle' style='margin:auto;background-color:" +
                  status +
                  ";'></div></td></tr>"
              );
              count = i + 1;
            }
            this.iaqHealth(count);
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 403) {
          $("#syshealth_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#sys-error").text(
            "Sensor Health : Request failed with status code " +
              error.response.status
          );
        }
      });
  };

  iaqHealth = (count) => {
    axios({ method: "GET", url: irqSensor })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              let timestamp =
                  data[i].lastseen.substr(0, 10) +
                  " " +
                  data[i].lastseen.substr(11, 8),
                status = "red";
              if (new Date() - new Date(data[i].lastseen) <= 2 * 60 * 1000) {
                status = "green";
              }
              $("#sensorHealth").append(
                "<tr><td>" +
                  parseInt(count + parseInt(i + 1)) +
                  "</td><td>" +
                  data[i].macid +
                  "</td><td>IAQ Sensor</td><td>" +
                  data[i].battery +
                  "</td><td>" +
                  timestamp +
                  "</td><td>" +
                  "<div class='circle' style='margin:auto;background-color:" +
                  status +
                  ";'></div></td></tr>"
              );
            }
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 403) {
          $("#syshealth_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#sys-error").text(
            "Sensor Health : Request failed with status code " +
              error.response.status
          );
        }
      });
  };

  /** Fetch health details of all employee tags registered */
  assetHealth = () => {
    axios({ method: "GET", url: employeeRegistration+"?key=all" })
      .then((response) => {
        console.log('employee======>',response);
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            $("#systemHealth").empty();
            for (let i = 0; i < data.length; i++) {
              let timestamp =
                  data[i].lastseen.substr(0, 10) +
                  " " +
                  data[i].lastseen.substr(11, 8),
                status = "red";
              if (new Date() - new Date(data[i].lastseen) <= 2 * 60 * 1000) {
                status = "green";
              }
              $("#systemHealth").append(
                "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].tagid +
                  "</td><td>" +
                  data[i].battery +
                  "</td><td>" +
                  timestamp +
                  "</td><td>" +
                  "<div class='circle' style='margin:auto;background-color:" +
                  status +
                  ";'></div></td></tr>"
              );
            }
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 403) {
          $("#syshealth_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else {
          $("#sys-error").text(
            "Employee Tag : Request failed with status code " +
              error.response.status
          );
        }
      });
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#syshealth_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  render() {
    return (
      <Fragment>
        <Helmet>
          <title>System Health</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">SYSTEM HEALTH</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "40px" }}>
            <p className="error-msg" id="sys-error"></p>
            <br></br>
            {/* Maseter Gateway Table */}
            <span className="heading">Master Gateway</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MASTER ID</th>
                  <th>FLOOR NAME</th>
                  <th>LAST SEEN</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody id="gatewayHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/* Slave Gateway Table */}
            <span className="heading">Slave Gateway</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>SLAVE ID</th>
                  <th>FLOOR NAME</th>
                  <th>MASTER GATEWAY ID</th>
                  <th>LAST SEEN</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody id="slaveHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/*Signal Repeater Table */}
            <span className="heading">Signal Repeater</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MAC ID</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="signalRepeaterHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/*Sensor Table */}
            <span className="heading">Sensors</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MAC ID</th>
                  <th>Sensor Type</th>
                  <th>Battery Status (%)</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="sensorHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
            {/* Assets Table */}
            <span className="heading">Assets</span>
            <br />
            <img
              src="../images/Tiles/Underline.png"
              alt=""
              style={{
                width: "56px",
                height: "3px",
                marginTop: "2px",
                position: "absolute",
              }}
            />
            <table style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>Asset MAC ID</th>
                  <th>Battery Status (%)</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="systemHealth"></tbody>
            </table>
            {/* ----------------------------------------------- */}
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="syshealth_displayModal" className="modal">
          <div className="modal-content">
            <p id="content" style={{ textAlign: "center" }}></p>
            <button
              id="ok"
              className="btn-center btn success-btn"
              onClick={this.sessionTimeout}
            >
              OK
            </button>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SystemHealth;
