import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import {
  employeeRegistration,
  irqSensor,
  signalRepeator,
  tempertureSensor,
} from "../../urls/apis";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class Assets extends Component {
  numberPerPage = 15;

  // variables required for sensor tags table
  pageList = [];
  currentPage = 1;
  numberOfPages = 0;
  currentRowCount = 0;

  // variables required for signal repeater tags table
  s_pageList = [];
  s_currentPage = 1;
  s_numberOfPages = 0;
  s_currentRowCount = 0;

  // variables required for tracking tags table
  e_pageList = [];
  e_currentPage = 1;
  e_numberOfPages = 0;
  e_currentRowCount = 0;

  senC = 0;
  sensorArray = [];

  /** Defining the states of the Component */
  constructor() {
    super();
    this.state = {
      sesnorlist: [],
      signalrepeaterlist: [],
      employeelist: [],
    };
  }

  /** Method is called on Component Load */
  componentDidMount() {
    this.tagTypeBasedData();
  }

  tagTypeBasedData = () => {
    let tagtype = $("#tagtype").val();
    $("#asset-error").text("");
    $("#sensor_container").css("display", "none");
    $("#iaq_container").css("display", "none");
    $("#signal_container").css("display", "none");
    $("#emp_container").css("display", "none");
    if (tagtype === "temperature") {
      axios({
        method: "GET",
        url: tempertureSensor,
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            let data = response.data;
            console.log("SENSOR---->", data);
            if (data.length !== 0) {
              $("#sensor_container").css("display", "block");
              for (let i = 0; i < data.length; i++) {
                $("#sensorTable").append(
                  "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].macid +
                  "</td><td>" +
                  "Temp/Humidity Sensors" +
                  "</td></tr>"
                );
              }
            } else {
              $("#asset-error").text("No data found.");
            }
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#asset_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again"
            );
          } else {
            $("#asset-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else if (tagtype === "iaq") {
      console.log("tagtype======>", tagtype);
      axios({
        method: "GET",
        url: irqSensor,
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            let data = response.data;
            if (data.length !== 0) {
              console.log("IAQ =====>", data);
              $("#iaq_container").css("display", "block");
              for (let i = 0; i < data.length; i++) {
                $("#iaqTable").append(
                  "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].macid +
                  "</td><td>" +
                  "IAQ Sensor" +
                  "</td></tr>"
                );
              }
            } else {
              $("#asset-error").text("No data found.");
            }
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.status === 403) {
            $("#asset_displayModal").css("display", "block");
            $("#content").text("User Session has timed out. Please Login again");
          } else {
            $("#asset-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else if (tagtype === "signal") {
      console.log("tagtype======>", tagtype);
      axios({
        method: "GET",
        url: signalRepeator,
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            let data = response.data;
            if (data.length !== 0) {
              console.log("SIGNAL =====>", data);
              $("#signal_container").css("display", "block");
              for (let i = 0; i < data.length; i++) {
                $("#signalTable").append(
                  "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].macid +
                  "</td></tr>"
                );
              }
            } else {
              $("#asset-error").text("No data found.");
            }
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.status === 403) {
            $("#asset_displayModal").css("display", "block");
            $("#content").text("User Session has timed out. Please Login again");
          } else {
            $("#asset-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else if (tagtype === "employee") {
      console.log("tagtype======>", tagtype);
      axios({
        method: "GET",
        url: employeeRegistration + "?key=all",
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            let data = response.data;
            if (data.length !== 0) {
              console.log('EMPLOYEE ====>', data);
              $("#emp_container").css("display", "block")
              for (let i = 0; i < data.length; i++) {
                $("#employeeTable").append(
                  "<tr><td>" +
                  (i + 1) +
                  "</td><td>" +
                  data[i].tagid +
                  "</td><td>" +
                  data[i].name +
                  "</td><td>" +
                  data[i].empid +
                  "</td><td>" +
                  data[i].email +
                  "</td><td>" +
                  data[i].intime.substring(0, 19).replace("T", " ") +
                  "</td></tr>"
                );
              }
            } else {
              $("#asset-error").text("No data found.");
            }
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#asset_displayModal").css("display", "block");
            $("#content").text("User Session has timed out. Please Login again");
          } else {
            $("#asset-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#asset_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Assets</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">ALL ASSETS</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />

          <div className="container fading" style={{ marginTop: "20px" }}>
            <div className="row">
              <div className="input-group">
                <span className="label">Tag Type : </span>
                <select
                  name="tagtype"
                  id="tagtype"
                  onChange={this.tagTypeBasedData}
                >
                  <option value="temperature">
                    Temperature/Humidity Sensor
                  </option>
                  <option value="iaq">IAQ Sensor</option>
                  <option value="signal">Signal Repeater</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </div>
            <p className="error-msg" id="asset-error"></p>
            <hr />
            <div className="row" id="tables">
              {/* SENSOR TAGS TABLE */}
              <div className="container" id="sensor_container" style={{ display: "none" }}>
                <span className="heading">Sensor Tags</span>
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
                {/* Table displays Sensor tags registered */}
                <table
                  id="sensorTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                      <th>SENSOR TYPE</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>


              {/* --------------------- */}
              {/* IAQ SENSORS */}
              <div className="container" id="iaq_container" style={{ display: "none" }}>
                <span className="heading">IAQ Tags</span>
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
                {/* Table displays IAQ tags registered */}
                <table
                  id="iaqTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                      <th>SENSOR TYPE</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>

              {/* ------------------------------------------- */}
              {/* SIGNAL REPEATER TAGS TABLE */}
              <div className="container" id="signal_container" style={{ display: "none" }}>
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
                {/* Table displays Sensor tags registered */}
                <table
                  id="signalTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
              {/* ------------------------------------------- */}
              {/* TRACKING TAGS TABLE */}
              <div className="container" id="emp_container" style={{ display: "none" }}>
                <span className="heading">Employee Tags</span>
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
                {/* Table displays Employee tags registered */}
                <table
                  id="employeeTable"
                  style={{
                    marginTop: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>MAC ID</th>
                      <th>EMPLOYEE NAME</th>
                      <th>EMPLOYEE ID</th>
                      <th>EMAIL ID</th>
                      <th>IN TIME</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
              {/* ----------------------------------------------------- */}
            </div>
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="asset_displayModal" className="modal">
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

export default Assets;
