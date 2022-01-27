import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import {
  assetDetails,
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
    // linkClicked(4);

    // API call to get all temperature humidity sensor data
    axios({
      method: "GET",
      url: tempertureSensor,
    })
      .then((response) => {
        let data = response.data;
        if (data.length !== 0) {
          for (let i = 0; i < data.length; i++) {
            this.senC++;
            this.sensorArray.push(
              "<tr id=" +
                data[i].macid +
                " ><td>" +
                this.senC +
                "</td><td>" +
                data[i].macid +
                "</td><td>Temperature/Humidity Sensor</td></tr>"
            );
          }
          // Setting the state with sensor tag list
          this.setState({ sesnorlist: [...this.sensorArray] });
          this.numberOfPages = Math.ceil(
            this.sensorArray.length / this.numberPerPage
          );
          this.currentRowCount = this.senC;
          // Calling methods to display tag list with pagination added
          this.loadList();
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#asset_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#asset-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });

    // API call to get all irq sensor data
    axios({
      method: "GET",
      url: irqSensor,
    })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              this.senC++;
              this.sensorArray.push(
                "<tr id=" +
                  data[i].macid +
                  " ><td>" +
                  this.senC +
                  "</td><td>" +
                  data[i].macid +
                  "</td><td>IAQ Sensor</td></tr>"
              );
            }
            // Setting the state with sensor tag list
            this.setState({ sesnorlist: [...this.sensorArray] });
            this.numberOfPages = Math.ceil(
              this.sensorArray.length / this.numberPerPage
            );
            this.currentRowCount = this.senC;
            // Calling methods to display tag list with pagination added
            this.loadList();
          }
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#asset_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#asset-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });

    // API call to get all signal repeator data
    axios({
      method: "GET",
      url: signalRepeator,
    })
      .then((response) => {
        let data = response.data;
        if (data.length !== 0) {
          let tagC = 0;
          let tagsArray = [];
          for (let i = 0; i < data.length; i++) {
            tagC++;
            tagsArray.push(
              "<tr id=" +
                data[i].macid +
                "><td>" +
                tagC +
                "</td><td>" +
                data[i].macid +
                "</td></tr>"
            );
          }
          // Setting the state with signal repeater tag list
          this.setState({ signalrepeaterlist: [...tagsArray] });
          this.s_numberOfPages = Math.ceil(
            tagsArray.length / this.numberPerPage
          );
          this.s_currentRowCount = tagC;
          // Calling methods to display tag list with pagination added
          this.loadSList();
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#asset_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#asset-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });

    // API call to get all employee tag details
    axios({
      method: "GET",
      url: employeeRegistration + "?key=all",
    })
      .then((response) => {
        let data = response.data;
        if (data.length !== 0) {
          let empC = 0;
          let employeeArray = [];
          for (let i = 0; i < data.length; i++) {
            empC++;
            let tagid = "Not Assigned";
            if (data[i].tagid) {
              tagid = data[i].tagid.tagid;
              employeeArray.push(
                "<tr id=" +
                  tagid +
                  // " class=" +
                  // data[i].tagType +
                  "><td>" +
                  empC +
                  "</td><td>" +
                  tagid +
                  "</td><td>" +
                  data[i].name +
                  "</td></tr>"
              );
            }
          }
          // Setting the state with tracking tag list
          this.setState({ employeelist: [...employeeArray] });
          this.e_numberOfPages = Math.ceil(
            employeeArray.length / this.numberPerPage
          );
          this.e_currentRowCount = empC;
          // Calling methods to display tag list with pagination added
          this.loadEList();
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#asset_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#asset-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  /** Pagination related code for sensor tags */
  loadList = () => {
    let begin = (this.currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    $("#currentpage").text(this.currentPage);
    $("#numberofpages").text(
      Math.ceil(this.state.sesnorlist.length / this.numberPerPage)
    );
    this.pageList = this.state.sesnorlist.slice(begin, end);
    $("#rowCount").text(this.pageList.length);

    $("#sensorTable").empty();
    $("#sensorTable").append(
      "<tr><th>S.No</th><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
    );
    for (let r = 0; r < this.pageList.length; r++) {
      $("#sensorTable").append(this.pageList[r]);
    }
    document.getElementById("next").disabled =
      this.currentPage === this.numberOfPages ? true : false;
    document.getElementById("previous").disabled =
      this.currentPage === 1 ? true : false;
  };

  nextPage = () => {
    this.currentPage = this.currentPage + 1;
    this.loadList();
  };

  previousPage = () => {
    this.currentPage = this.currentPage - 1;
    this.loadList();
  };

  /** Pagination related code for signal repeators tags */
  loadSList = () => {
    let begin = (this.s_currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    $("s_currentpage").text(this.s_currentPage);
    $("s_numberofpages").text(
      Math.ceil(this.state.signalrepeaterlist.length / this.numberPerPage)
    );
    this.s_pageList = this.state.signalrepeaterlist.slice(begin, end);
    $("s_rowCount").text(this.s_pageList.length);

    $("#signalRepeaterTable").empty();
    $("#signalRepeaterTable").append("<tr><th>S.No</th><th>MAC ID</th></tr>");
    for (let r = 0; r < this.s_pageList.length; r++) {
      $("#signalRepeaterTable").append(this.s_pageList[r]);
    }
    document.getElementById("s_next").disabled =
      this.s_currentPage === this.s_numberOfPages ? true : false;
    document.getElementById("s_previous").disabled =
      this.s_currentPage === 1 ? true : false;
  };

  nextSPage = () => {
    this.s_currentPage = this.s_currentPage + 1;
    this.loadSList();
  };

  previousSPage = () => {
    this.s_currentPage = this.s_currentPage - 1;
    this.loadSList();
  };

  /** Pagination related code for employee tags */
  loadEList = () => {
    let begin = (this.e_currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    $("#e_currentpage").text(this.e_currentPage);
    $("#e_numberofpages").text(
      Math.ceil(this.state.employeelist.length / this.numberPerPage)
    );
    this.e_pageList = this.state.employeelist.slice(begin, end);
    $("#e_rowCount").text(this.e_pageList.length);
    $("#employeeTable").empty();
    $("#employeeTable").append(
      "<tr><th>S.No</th><th>MAC ID</th><th>EMPLOYEE NAME</th></tr>"
    );
    for (let r = 0; r < this.e_pageList.length; r++) {
      $("#employeeTable").append(this.e_pageList[r]);
    }
    document.getElementById("e_next").disabled =
      this.e_currentPage === this.e_numberOfPages ? true : false;
    document.getElementById("e_previous").disabled =
      this.e_currentPage === 1 ? true : false;
  };

  nextEPage = () => {
    this.e_currentPage = this.e_currentPage + 1;
    this.loadEList();
  };

  previousEPage = () => {
    this.e_currentPage = this.e_currentPage - 1;
    this.loadEList();
  };

  search = () => {
    // Fetcing data entered by user for searching data
    let type = $("#type").val();
    let tagid = $("#tagid").val();
    document.getElementById("asset-error").innerHTML = "";

    // Erasing already existing table content
    $("#tempTable").empty();
    document.getElementById("tables").style.display = "none";
    document.getElementById("tempTable").style.display = "table";

    // Conditional statements to get the data and display in table
    // Displys all tracking tags
    if (tagid.length === 0) {
      if (type === "employee") {
        $("#tempTable").append(
          "<tr><th>S.No</th><th>MAC ID</th><th>EMPLOYEE NAME</th></tr>"
        );
        for (let i = 0; i < this.state.employeelist.length; i++) {
          $("#tempTable").append(this.state.employeelist[i]);
        }
      } else if (type === "signal-repeater") {
        $("#tempTable").append("<tr><th>S.No</th><th>MAC ID</th></tr>");
        for (let i = 0; i < this.state.signalrepeaterlist.length; i++) {
          $("#tempTable").append(this.state.signalrepeaterlist[i]);
        }
      } else if (type === "irq") {
        $("#tempTable").append(
          "<tr><th>S.No</th><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
        );
        for (let i = 0; i < this.state.sesnorlist.length; i++) {
          if (this.state.sesnorlist[i].indexOf("IAQ Sensor") !== -1)
            $("#tempTable").append(this.state.sesnorlist[i]);
        }
      } else if (type === "temperature") {
        $("#tempTable").append(
          "<tr><th>S.No</th><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
        );
        for (let i = 0; i < this.state.sesnorlist.length; i++) {
          if (
            this.state.sesnorlist[i].indexOf("Temperature/Humidity Sensor") !==
            -1
          )
            $("#tempTable").append(this.state.sesnorlist[i]);
        }
      }
    } else if (tagid.length !== 0) {
      if (!tagid.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
        $("#asset-error").text("Invalid tagid entered.");
      } else {
        axios({ method: "POST", url: assetDetails + tagid })
          .then((response) => {
            $("#tempTable").empty();
            if (response.status === 200 || response.status === 201) {
              if (response.data.length !== 0) {
                let data = response.data[0];
                if (data.tagType === "employee") {
                  $("#tempTable").append(
                    "<tr><th>MAC ID</th><th>EMPLOYEE NAME</th>" +
                      "<th>EMPLOYEE ID</th><th>EMAIL ID</th></tr>"
                  );
                  $("#tempTable").append(
                    "<tr><td>" +
                      data.macAddress +
                      "</td><td>" +
                      data.empName +
                      "</td><td>" +
                      data.empId +
                      "</td><td>" +
                      data.emailId +
                      "</td></tr>"
                  );
                } else if (data.tagType === "temperature/humidity sensor") {
                  $("#tempTable").append(
                    "<tr><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
                  );
                  $("#tempTable").append(
                    "<tr><td>" +
                      data.macAddress +
                      "</td><td>" +
                      data.tagType +
                      "</td></tr>"
                  );
                } else if (data.tagType === "signal-repeater") {
                  $("#tempTable").append(
                    "<tr><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
                  );
                  $("#tempTable").append(
                    "<tr><td>" +
                      data.macAddress +
                      "</td><td>" +
                      data.tagType +
                      "</td></tr>"
                  );
                } else if (data.tagType === "irq sensor") {
                  $("#tempTable").append(
                    "<tr><th>MAC ID</th><th>SENSOR TYPE</th></tr>"
                  );
                  $("#tempTable").append(
                    "<tr><td>" +
                      data.macAddress +
                      "</td><td>" +
                      data.tagType +
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
                "User Session has timed out.<br> Please Login again"
              );
            } else {
              $("#asset-error").text(
                "Request Failed with status code (" +
                  error.response.status +
                  ")."
              );
            }
          });
      }
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

          <div className="container fading" style={{ marginTop: "50px" }}>
            {/* Tag search options for both tracking and sensor tag */}
            <div className="row">
              {/* Select list for tag type */}
              <div className="input-group">
                <span className="label">Tag Type : </span>
                <select
                  name="type"
                  id="type"
                  onChange={() => {
                    document.getElementById("tagid").value = "";
                  }}
                >
                  <option value="temperature">
                    Temperature/Humidity Sensor
                  </option>
                  <option value="irq">IAQ Sensor</option>
                  <option value="signal-repeater">Signal Repeater</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              {/* Input field for tag MAC ID */}
              <div className="input-group" style={{ display: "none" }}>
                <span className="label">Tag MAC ID : </span>
                <input
                  type="text"
                  id="tagid"
                  placeholder="5a-c2-15-00-00-00"
                  required="required"
                />
              </div>
              {/* Button for searching tag */}
              <div className="input-group">
                <input
                  type="button"
                  value="Search"
                  onClick={this.search}
                  className="btn success-btn"
                />
                &nbsp;&nbsp;
                {/* Clearing search data and hiding search result table */}
                <input
                  type="button"
                  value="Clear"
                  onClick={() => {
                    document.getElementById("tempTable").style.display = "none";
                    document.getElementById("tables").style.display = "block";
                    document.getElementById("tagid").value = "";
                    document.getElementById("asset-error").innerHTML = "";
                  }}
                  className="btn success-btn"
                />
              </div>
            </div>
            <hr />
            <p className="error-msg" id="asset-error"></p>
            {/* Table for displaying search result */}
            <table
              id="tempTable"
              style={{
                marginTop: "20px",
                marginBottom: "30px",
              }}
            ></table>
            {/* Table for displaying all registered tags */}
            <div className="row" id="tables">
              {/* SENSOR TAGS TABLE */}
              <div className="container">
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
                {/* Page navigation options for sensor tags */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <p style={{ float: "left", fontFamily: "Roboto-Regular" }}>
                    ( <span id="currentpage">0</span> /
                    <span id="numberofpages">0</span> )
                  </p>
                  <button
                    id="previous"
                    onClick={this.previousPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Previous
                  </button>
                  <button
                    id="next"
                    onClick={this.nextPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Next
                  </button>
                  <p style={{ float: "right", fontFamily: "Roboto-Regular" }}>
                    Row count : <span id="rowCount">0</span>
                  </p>
                </div>
              </div>
              {/* ------------------------------------------- */}
              {/* SIGNAL REPEATER TAGS TABLE */}
              <div className="container">
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
                  id="signalRepeaterTable"
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
                {/* Page navigation options for sensor tags */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <p style={{ float: "left", fontFamily: "Roboto-Regular" }}>
                    ( <span id="s_currentpage">0</span> /
                    <span id="s_numberofpages">0</span> )
                  </p>
                  <button
                    id="s_previous"
                    onClick={this.previousSPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Previous
                  </button>
                  <button
                    id="s_next"
                    onClick={this.nextSPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Next
                  </button>
                  <p style={{ float: "right", fontFamily: "Roboto-Regular" }}>
                    Row count : <span id="s_rowCount">0</span>
                  </p>
                </div>
              </div>
              {/* ------------------------------------------- */}
              {/* TRACKING TAGS TABLE */}
              <div className="container">
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
                      {/* <th>EMPLOYEE ID</th> */}
                      {/* <th>EMAIL ID</th> */}
                      {/* <th>IN TIME</th> */}
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
                {/* Page navigation options for tracking tags */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <p style={{ float: "left", fontFamily: "Roboto-Regular" }}>
                    ( <span id="e_currentpage">0</span> /
                    <span id="e_numberofpages">0</span> )
                  </p>
                  <button
                    id="e_previous"
                    onClick={this.previousEPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Previous
                  </button>
                  <button
                    id="e_next"
                    onClick={this.nextEPage}
                    style={{ fontFamily: "Roboto-Medium" }}
                  >
                    Next
                  </button>
                  <p style={{ float: "right", fontFamily: "Roboto-Regular" }}>
                    Row count : <span id="e_rowCount">0</span>
                  </p>
                </div>
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
