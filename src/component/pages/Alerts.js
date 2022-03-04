import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
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
    linkClicked(4);
    this.getAlertData();
    this.interval = setInterval(this.getAlertData, 15 * 1000);
  }

  /** On page unload clears the interval set before */
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  /** Get alert data for all the tags and displays information in tabular format */
  getAlertData = () => {
    document.getElementById("alert-error").innerHTML = "";
    $("#alertsDetails1").empty();
    let alertTypeId = $("#type").val();
    console.log('======>', alertTypeId);
    axios({ method: "POST", url: "/api/alerts", data: { value: alertTypeId } })
      .then((response) => {
        console.log('response======>', response);
        if (response.status === 200 || response.status === 201) {
          if (response.data.length !== 0) {
            let data = response.data;
            let i = 0;
            let sno = 1;
            for (i = data.length - 1; i >= 0; i--) {
              var alert = "";
              let timestamp =data[i].timestamp.substring(0, 19).replace("T"," ");
              if (data[i].value === 1) alert = "Panic Button";
              else if (data[i].value === 3) alert = "Free Fall";
              else if (data[i].value === 4) alert = "No activity";
              else if (data[i].value === 5) alert = "Low Battery";
              $("#alertsDetails1").append(
                "<tr>" +
                "<td>" + (sno) + "</td>" +
                "<td>" + data[i].asset.tagid + "</td>" +
                "<td>" + data[i].asset.name + "</td>" +
                "<td>" + alert + "</td>" +
                "<td>" + timestamp + "</td>" +
                "</tr>"
              );
              sno += 1;
            }
          } else {
            $("#alert-error").text("No alert is generated.");
          }
        } else {
          $("#alert-error").text("Unable to fetch Alert Data.");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#alert_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        }  else if(error.response.status === 404) {
          $("#alert-error").text(
            "No Data Found."
          );
        }else {
          $("#alert-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
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
                <select name="type" id="type" onChange={this.getAlertData}>
                  <option value="1">Panic Button</option>
                  <option value="3">Free Fall</option>
                  <option value="4">No Activity</option>
                  <option value="5">Low Battery</option>
                </select>
              </div>
            </div>
            <hr />
            <br></br>
            <p className="error-msg" id="alert-error"></p>
            <div className="row" id="alertBlock">
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
              
              <table id="alertDet1"
              style={{ marginTop: "20px", marginBottom: "30px" }}>
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>MAC ID</th>
                  <th>EMPLOYEE NAME</th>
                  <th>ALERT TYPE</th>
                  <th>LAST SEEN</th>
                </tr>
              </thead>
              <tbody id="alertsDetails1"></tbody>
            </table>
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
