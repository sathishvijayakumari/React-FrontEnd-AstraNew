import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import { alertData } from "../../urls/apis";

const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class Alerts extends Component {
  numberPerPage = 25;
  pageList = [];
  currentPage = 1;
  numberOfPages = 0;
  currentRowCount = 0;

  constructor() {
    super();
    this.state = {
      alertList: [],
    };
  }

  /** On page load call a method and sets interval for the same */
  componentDidMount() {
    linkClicked(6);
    this.getAlertDate();
    this.interval = setInterval(this.getAlertDate, 15 * 1000);
  }

  /** On page unload clears the interval set before */
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  /** Get alert data for all the tags and displays information in tabular format */
  getAlertDate = () => {
    document.getElementById("alert-error").innerHTML = "";
    // API call
    axios({
      method: "GET",
      url: alertData,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          if (response.data.length !== 0) {
            $("#alertBlock").css("display", "block");
            this.data = response.data;
            let alertdata = [];
            let i = 0;
            for (i = this.data.length - 1; i >= 0; i--) {
              var alert;
              if (this.data[i].value === 1) alert = "Panic Button";
              else if (this.data[i].value === 3) alert = "Free Fall";
              else if (this.data[i].value === 4) alert = "No activity";
              else if (this.data[i].value === 5) alert = "Low Battery";
              alertdata.push(
                "<tr class=" +
                  this.data[i].value +
                  ">" +
                  "<td>" +
                  this.data[i].asset.tagid +
                  "</td>" +
                  // "<td>" +
                  // this.data[i].asset.tagType +
                  // "</td>" +
                  "<td>" +
                  alert +
                  "</td>" +
                  "<td>" +
                  this.data[i].timestamp.substring(0, 10) +
                  " " +
                  this.data[i].timestamp.substring(11, 19) +
                  "</td>" +
                  "</tr>"
              );
            }
            this.setState({ alertList: [...alertdata] });
            this.numberOfPages = Math.ceil(
              alertdata.length / this.numberPerPage
            );
            this.currentRowCount = i;
            this.loadList();
          } else {
            $("#alert-error").text("No alert is genereated.");
          }
        } else {
          $("#alert-error").text("Unable to fetch Alert Data.");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#alert_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#alert-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Code for adding pagination */
  loadList = () => {
    let begin = (this.currentPage - 1) * this.numberPerPage;
    let end = begin + this.numberPerPage;
    $("#currentpage").text(this.currentPage);
    $("#numberofpages").text(
      Math.ceil(this.state.alertList.length / this.numberPerPage)
    );
    this.pageList = this.state.alertList.slice(begin, end);
    $("#rowCount").text(this.pageList.length);

    $("#alertTable").empty();
    $("#alertTable").append(
      " <tr><th>ASSET MAC ID</th><th>EVENT</th><th>TIMESTAMP</th></tr>"
    );
    for (let r = 0; r < this.pageList.length; r++) {
      $("#alertTable").append(this.pageList[r]);
    }
    document.getElementById("next").disabled =
      this.currentPage === this.numberOfPages ? true : false;
    document.getElementById("previous").disabled =
      this.currentPage === 1 ? true : false;
  };

  /** Forword moivng pages */
  nextPage = () => {
    this.currentPage = this.currentPage + 1;
    this.loadList();
  };

  /** Backword moving pages */
  previousPage = () => {
    if (this.currentPage > 0) this.currentPage = this.currentPage - 1;
    this.loadList();
  };

  /** Searching data based on filter option selected */
  search = () => {
    $("#tempTable").empty();
    let type = $("#type").val();
    let data = this.state.alertList;
    $("#alert-error").text("");
    $("#tempTable").css("display", "table");
    $("#alertTable").css("display", "none");
    $("#opt").css("display", "none");
    $("#tempTable").append(
      "<tr><th>ASSET MAC ID</th><th>EVENT</th><th>TIMESTAMP</th></tr>"
    );
    for (let i = 0; i < data.length; i++) {
      if (data[i].substring(10, 11) === type) {
        $("#tempTable").append(data[i]);
      }
    }
    if ($("#tempTable").children("tr").length === 1) {
      $("#alert-error").text("No data found.");
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#alert_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Alerts</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">ALERTS</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}>
            <div className="row">
              {/* Select list for tag type */}
              <div className="input-group">
                <span className="label">Event Type : </span>
                <select name="type" id="type">
                  <option value="1">Panic Button</option>
                  <option value="3">Free Fall</option>
                  <option value="4">No Activity</option>
                  <option value="5">Low Battery</option>
                </select>
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
                    document.getElementById("alertTable").style.display =
                      "table";
                    document.getElementById("opt").style.display = "block";
                    document.getElementById("alert-error").innerHTML = "";
                  }}
                  className="btn success-btn"
                />
              </div>
            </div>
            <hr />
            <br></br>
            <p className="error-msg" id="alert-error"></p>
            <div className="row" id="alertBlock" style={{ display: "none" }}>
              <span className="heading">ALERT INFORMATION</span>
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
              {/* Table to display alert msgs */}
              <table
                id="tempTable"
                style={{
                  marginTop: "20px",
                  marginBottom: "30px",
                  display: "none",
                }}
              ></table>

              {/* Table to display alert msgs */}
              <table
                id="alertTable"
                style={{ marginTop: "20px", marginBottom: "30px" }}
              ></table>
              {/* Page navigation options for sensor tags */}
              <div
                id="opt"
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
          </div>
        </div>
        {/* Display modal to display error messages */}
        <div id="alert_displayModal" className="modal">
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

export default Alerts;
