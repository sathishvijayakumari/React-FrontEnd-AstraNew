/* eslint-disable no-useless-concat */
import React, { Component, Fragment } from "react";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import "./Pulse.css";
import {
  zoneConfiguration,
} from "../../urls/apis";
import Chart from "chart.js/auto";

const graphBtn = {
  padding: "8px 10px",
  border: "none",
  marginLeft: "15px",
  borderRadius: "4px",
  fontSize: "16px",
  cursor: "pointer",
  color: "Black",
  fontWeight: "bold",
  boxShadow: "3px 3px 5px 3px rgba(0, 0, 0, 0.25)",
};

axios.defaults.xsrfHeaderName = "x-csrftoken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

class Tracking extends Component {
  // local variable
  fWidth = 0;
  fHeight = 0;
  // jsonData = [];
  interval = "";
  panicinterval = "";
  c = 0;
  xpixel = 0;
  flag = "false";
  floorData = [];

  componentDidMount() {
    linkClicked(1);
    axios({
      method: "GET",
      url: "/api/uploadmap",
      headers: {
        "content-type": "multipart/form-data",
      },
    })
      .then((response) => {
        console.log("=======>", response);
        if (response.status === 201 || response.status === 200) {
          $("#floor-error").text("");
          this.fdata = response.data;
          if (this.fdata.length !== 0) {
            $("#floorBlock").css("display", "block");
            for (let i = 0; i < this.fdata.length; i++) {
              $("#fname").append(
                "<option value=" + i + ">" + this.fdata[i].name + "</option>"
              );
            }
            this.floorData = response.data;
            this.plotFloorMap();
          } else {
            $("#floor-error").text("Please upload a floormap.");
          }
        } else {
          $("#floor-error").text("Unable to get Floor Map.");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#floor-error").text("No data found.");
        } else {
          $("#floor-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearTimeout(this.timeout);
    clearTimeout(this.pilot_asset_inter);
  }

  plotFloorMap = () => {
    $("#track-error").text("");
    let floorID = $("#fname").val();
    this.fimage = this.floorData[floorID];
    this.fWidth = this.fimage.width;
    this.fHeight = this.fimage.height;
    $("#tempimg").attr("src", this.fimage.image);
    $("#tempimg").attr("style", "width:" + "auto;" + "height:" + "auto;");
    $("#lastupdated").css("display", "none");
    $("#temp").children("div").remove();
    $("#tempChart").remove();
    $("#temp .sensors").remove();
    $("#graphBlock").css("display", "none");
    $("input[type=text]").val("");
    this.timeout = setTimeout(() => {
      $("#temp .sensors").remove();
      $("#temp #empls").remove();
      this.getZones();
      this.panicData();
    }, 2 * 1000);
    clearInterval(this.interval);
    this.interval = setInterval(this.panicData, 5 * 1000);
  };

  getZones = () => {
    let floorID = $("#fname").val();
    $("#track-error").text("");
    this.wp = document.getElementById("temp").clientWidth;
    this.hp = document.getElementById("temp").clientHeight;
    console.log(this.wp, "==========", this.hp);
    axios({
      method: "GET",
      url: zoneConfiguration + "?floorid=" + this.floorData[floorID].id,
    })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          $("#temp .sensors").remove();
          let wpx = this.wp / this.fWidth;
          let hpx = this.hp / this.fHeight;
          if (response.data.length !== 0) {
            let data = response.data;
            $("#tempimg").attr(
              "style",
              "width:" + this.wp + "px;" + "height:" + this.hp + "px;"
            );
            for (let i = 0; i < data.length; i++) {
              let xaxis = 0,
                yaxis = 0;
              xaxis = parseInt(wpx * parseFloat(data[i].x1));
              yaxis = parseInt(hpx * parseFloat(data[i].y1));
              let width = Math.ceil((data[i].x2 - data[i].x1) * wpx);
              let height = Math.ceil((data[i].y2 - data[i].y1) * hpx);
              let childDiv1 = document.createElement("div");
              $(childDiv1).attr("id", data[i].zonename);
              $(childDiv1).attr("class", "sensors");
              $(childDiv1).attr("title", "ZoneName: " + data[i].zonename);
              $(childDiv1).attr(
                "style",
                "border:1px solid black;background:rgba(0, 0, 0,0.29);" +
                "position: absolute; cursor: pointer; left:" +
                xaxis +
                "px; top:" +
                yaxis +
                "px;" +
                "width:" +
                width +
                "px;" +
                "height:" +
                height +
                "px;"
              );
              $(childDiv1).on("click", () => {
                this.getDailyData(data[i].zonename, this.floorData[floorID].id);
              });
              $("#temp").append(childDiv1);
            }
          }
        }
      })
      .catch((error) => {
        console.log("error===>", error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No zones data found.");
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  panicData = () => {
    let alert_data = [];
    let fname = $("#fname").val();
    // $("#temp #empls").remove();
    axios({
      method: "GET",
      url: "/api/alert/panic?floor=" + this.floorData[fname].id,
    })
      .then((response) => {
        if (response.status === 200) {
          let data = response.data;
          if (data.length !== 0) {
            console.log("alert_data-------->", data);
            for (let i = 0; i < data.length; i++) {
              alert_data.push(data[i]);
            }
          }
        }
      })
      .catch((error) => {
        console.log("plotAssets--error====>", error);
      });
    this.pilot_asset_inter = setTimeout(() => this.plotAssets(alert_data), 2 * 1000);
  };

  plotAssets = (alert_data) => {
    let fname = $("#fname").val();
    $("#total").text("0");
    $("#track-error").text("");
    $("#temp #empls").remove();
    console.log("alert_data---------------->", alert_data);
    axios({
      method: "GET",
      url: "/api/employee/tracking?floor=" + this.floorData[fname].id,
    })
      .then((response) => {
        console.log("plotAssets response========>", response);
        if (response.status === 200) {
          $("#track-error").text("");
          let data = response.data;
          if (data.length !== 0) {
            let wpx = document.getElementById("temp").clientWidth / this.fWidth;
            let hpx = document.getElementById("temp").clientHeight / this.fHeight;
            $("#lastupdated").css("display", "block");
            let totaltags = 0;
            let update_time =  data[0].lastseen.substring(0, 19).replace("T", " ");
            for (let i = 0; i < data.length; i++) {
              let timestamp =
                new Date() -
                new Date(data[i].lastseen.substring(0, 19).replace("T", " "));
              if (timestamp <= 2 * 60 * 1000) {
                let color = "blue";
                if (alert_data.length > 0) {
                  for (let j = 0; j < alert_data.length; j++) {
                    if (data[i].tagid === alert_data[j].asset.tagid) {
                      let time_stamp =
                        new Date() -
                        new Date(
                          alert_data[j].timestamp.substring(0, 10) +
                          " " +
                          alert_data[j].timestamp.substring(11, 19)
                        );
                      if (time_stamp <= 2 * 60 * 1000) {
                        if (alert_data[j].value === 1) {
                          color = "red";
                          break;
                        } else if (alert_data[j].value === 3) {
                          color = "yellow";
                          break;
                        } else {
                          color = "blue";
                          break;
                        }
                      }
                    }
                  }
                } else {
                  color = "blue";
                }
                console.log(data[i].tagid, "PANIC COLOR ------->", color);
                totaltags = totaltags + 1;

                let empDiv = document.createElement("div");
                $(empDiv).attr("id", "empls");
                $(empDiv).attr("class", "emp_" + data[i].tagid);

                let inner_circle = document.createElement("div");
                $(inner_circle).attr(
                  "style",
                  "left:" +
                  (wpx * parseFloat(data[i].x)).toFixed(2) +
                  "px; top:" +
                  (hpx * parseFloat(data[i].y)).toFixed(2) +
                  "px;"
                );
                let pulse = document.createElement("div");
                if (color === "red") {
                  $(inner_circle).attr("class", "inner_circle_red");
                  $(pulse).attr("class", "pulsatingcircle_red");
                } else if (color === "yellow") {
                  $(inner_circle).attr("class", "inner_circle_yellow");
                  $(pulse).attr("class", "pulsatingcircle_yellow");
                } else if (color === "blue") {
                  $(inner_circle).attr("class", "inner_circle_blue");
                  $(pulse).attr("class", "pulsatingcircle_blue");
                }

                $(inner_circle).attr(
                  "title",
                  "Employee Name  : " +
                  data[i].name +
                  "\nTag ID : " +
                  data[i].tagid +
                  "\nX : " +
                  data[i].x.toFixed(2) +
                  "\nY : " +
                  data[i].y.toFixed(2)
                );
                $(inner_circle).append(pulse);
                $(empDiv).append(inner_circle);
                $("#temp").append(empDiv);
                $("#timing").text(update_time);
              } else if (totaltags === 0) {
                let upd_Time =
                  data[0].lastseen.substring(0, 10) +
                  " " +
                  data[0].lastseen.substring(11, 19);
                $("#timing").text(upd_Time);
              }
            }
            $("#total").text(totaltags);
            if ($("#temp").children("div").length === 0) {
              $("#track-error").text("No asset detected.");
            } else {
              $("#track-error").text("");
            }
          } else {
            $("#track-error").text(
              "No Asset is turned on, Please check System Health Page."
            );
          }
        } else {
          $("#track-error").text("Unable to get Tags Data.");
        }
      })
      .catch((error) => {
        console.log("error=====>", error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No Asset data found.");
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  getDailyData = (zonename, floorid) => {
    $("#graphBlock").css("display", "none");
    $("#track-error").text("");
    $("#tempChart").remove();
    axios({
      method: "POST",
      url: "/api/zones/tracking",
      data: { floorid: floorid, zonename: zonename },
    })
      .then((response) => {
        console.log("Response=---->", response);
        if (response.status === 200) {
          if (response.data.length !== 0) {
            $("#graphBlock").css("display", "block");
            this.optionChange("opt0");
            $("#chartID").text(zonename);
            let data = response.data;
            var timing = [],
              count = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(data[i].timestamp);
              count.push(data[i].count);
            }
            if ($("#chartCanvas").children().length !== 0)
              $("#tempChart").remove();
            var cnvs = document.createElement("canvas");
            $(cnvs).attr("id", "tempChart");
            $(cnvs).attr("width", "50px");
            $(cnvs).attr("height", "20px");
            $("#chartCanvas").append(cnvs);
            // chart displaying code
            const tempChart = $("#tempChart");
            new Chart(tempChart, {
              type: "line",
              data: {
                //Bring in data
                labels: timing,
                datasets: [
                  {
                    label: "Employee Count",
                    data: count,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 0.5,
                    lineTension: 0.4,
                  },
                ],
              },
              options: {
                responsive: true,
                scales: {
                  xAxes: [{ ticks: { display: true } }],
                  yAxes: [
                    { ticks: { beginAtZero: true, min: 0, stepSize: 50 } },
                  ],
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "right",
                    fontSize: 35,
                  },
                },
              },
            });
            window.scrollTo(0, document.body.scrollHeight);
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No daily data found.");
          window.scrollTo(0, 0);
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  optionChange = (btnId) => {
    $("#opt0").css({ background: "none", color: "#000" });
    $("#opt1").css({ background: "none", color: "#000" });
    $("#opt2").css({ background: "none", color: "#000" });
    console.log("----->", btnId);
    $("#" + btnId).css({ background: "rgb(0, 98, 135)", color: "#FFF" });
  };

  /** Daily tracking data for paricular zone already selected  */
  dailyData = (btnId) => {
    this.optionChange(btnId);
    $("#track-error").text("");
    $("#tempChart").remove();
    let floorID = $("#fname").val();
    axios({
      method: "POST",
      url: "/api/zones/tracking",
      data: {
        floorid: this.floorData[floorID].id,
        zonename: $("#chartID").text(),
      },
    })
      .then((response) => {
        console.log("dailyData() Response=====>", response);
        if (response.status === 200) {
          if (response.data.length !== 0) {
            let data = response.data;
            var timing = [],
              count = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(data[i].timestamp);
              count.push(data[i].count);
            }
            if ($("#chartCanvas").children().length !== 0)
              $("#tempChart").remove();
            var cnvs = document.createElement("canvas");
            $(cnvs).attr("id", "tempChart");
            $(cnvs).attr("width", "50px");
            $(cnvs).attr("height", "20px");
            $("#chartCanvas").append(cnvs);
            // chart displaying code
            const tempChart = $("#tempChart");
            new Chart(tempChart, {
              type: "line",
              data: {
                //Bring in data
                labels: timing,
                datasets: [
                  {
                    label: "Employee Count",
                    data: count,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 0.5,
                    lineTension: 0.4,
                  },
                ],
              },
              options: {
                responsive: true,
                scales: {
                  xAxes: [{ ticks: { display: true } }],
                  yAxes: [
                    { ticks: { beginAtZero: true, min: 0, stepSize: 50 } },
                  ],
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "right",
                    fontSize: 35,
                  },
                },
              },
            });
            window.scrollTo(0, document.body.scrollHeight);
          } else {
            window.scrollTo(0, 0);
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        console.log("dailyData() error ======>", error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No daily data found.");
          window.scrollTo(0, 0);
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Weekly tracking data for paricular zone already selected  */
  weeklyReport = (btnId) => {
    this.optionChange(btnId);
    let floorID = $("#fname").val();
    $("#tempChart").remove();
    $("#track-error").text("");
    axios({
      method: "POST",
      url: "/api/zones/weekly/tracking",
      data: {
        floorid: this.floorData[floorID].id,
        zonename: $("#chartID").text(),
      },
    })
      .then((response) => {
        console.log("weeklyReport() Response=====>", response);
        if (response.status === 200) {
          if (response.data.length !== 0) {
            // console.log(response);
            let data = response.data;
            var timing = [],
              count = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(
                data[i].timestamp.substr(8, 2) +
                " " +
                data[i].timestamp.substr(11, 5)
              );
              count.push(data[i].count);
            }
            if ($("#chartCanvas").children().length !== 0)
              $("#tempChart").remove();
            var cnvs = document.createElement("canvas");
            $(cnvs).attr("id", "tempChart");
            $(cnvs).attr("width", "50px");
            $(cnvs).attr("height", "20px");
            $("#chartCanvas").append(cnvs);
            // chart displaying code
            const tempChart = $("#tempChart");
            new Chart(tempChart, {
              type: "line",
              data: {
                //Bring in data
                labels: timing,
                datasets: [
                  {
                    label: "Employee Count",
                    data: count,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 0.5,
                    lineTension: 0.4,
                  },
                ],
              },
              options: {
                responsive: true,
                scales: {
                  xAxes: [{ ticks: { display: true } }],
                  yAxes: [
                    { ticks: { beginAtZero: true, min: 0, stepSize: 50 } },
                  ],
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "right",
                    fontSize: 35,
                  },
                },
              },
            });
            window.scrollTo(0, document.body.scrollHeight);
          } else {
            window.scrollTo(0, 0);
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        console.log("Weekly() error ======>", error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No weekly data found.");
          window.scrollTo(0, 0);
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Monthly tracking data for paricular zone already selected  */
  monthlyReport = (btnId) => {
    this.optionChange(btnId);
    let floorID = $("#fname").val();
    $("#tempChart").remove();
    $("#track-error").text("");
    axios({
      method: "POST",
      url: "/api/zones/monthly/tracking",
      data: {
        floorid: this.floorData[floorID].id,
        zonename: $("#chartID").text(),
      },
    })
      .then((response) => {
        console.log("monthlyReport() Response=====>", response);
        if (response.status === 200) {
          if (response.data.length !== 0) {
            let data = response.data;
            var timing = [],
              count = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(data[i].timestamp.substr(0, 10));
              count.push(data[i].count);
            }
            if ($("#chartCanvas").children().length !== 0)
              $("#tempChart").remove();
            var cnvs = document.createElement("canvas");
            $(cnvs).attr("id", "tempChart");
            $(cnvs).attr("width", "50px");
            $(cnvs).attr("height", "20px");
            $("#chartCanvas").append(cnvs);
            // chart displaying code
            const tempChart = $("#tempChart");
            new Chart(tempChart, {
              type: "line",
              data: {
                //Bring in data
                labels: timing,
                datasets: [
                  {
                    label: "Employee Count",
                    data: count,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 0.5,
                    lineTension: 0.4,
                  },
                ],
              },
              options: {
                responsive: true,
                scales: {
                  xAxes: [{ ticks: { display: true } }],
                  yAxes: [
                    { ticks: { beginAtZero: true, min: 0, stepSize: 50 } },
                  ],
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "right",
                    fontSize: 35,
                  },
                },
              },
            });
            window.scrollTo(0, document.body.scrollHeight);
          } else {
            window.scrollTo(0, 0);
          }
        }
      })
      .catch((error) => {
        // console.log(error);
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        console.log("dailyData() error ======>", error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#track-error").text("No monthly data found.");
          window.scrollTo(0, 0);
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#tracking_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  search = () => {
    let id = $("#tagid").val();
    console.log("searchhhhh====", id);
    $("#track-error").text("");
    if (id.length === 0) {
      $("#track-error").text("Please enter Employee Tag ID.");
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#track-error").text("Invalid Tag ID entered.");
    } else if (id.length !== 0) {
      this.flag = "true";
      console.log("SEarch====", id);
      // $("#temp").children("div").css("display", "none");
      $("#temp #empls").css("display", "none");
      $("#temp .emp_" + id).css("display", "block");
    } else {
      $("#track-error").text("Asset Not Found.");
    }
  };

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <>
          <title>Realtime Tracking</title>
        </>
        <div style={{ float: "right", width: "91%", marginTop: "90px" }}>
          <span className="main-heading">REALTIME TRACKING</span>
          <p className="underLine" />
          <div className="container fading">
            <div className="row">
              <div className="input-group">
                <span className="label">Floor Name : </span>
                <select
                  name="type"
                  id="fname"
                  onChange={() => {
                    this.plotFloorMap();
                  }}
                ></select>
              </div>
            </div>

            <div id="floorBlock" style={{ display: "none" }}>
              <div className="row">
                <div className="input-group">
                  <span className="label">Tag MAC ID : </span>
                  <input
                    type="text"
                    id="tagid"
                    placeholder="5a-c2-15-00-00-00"
                    required="required"
                    onClick={() => $("#track-error").text("")}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="button"
                    value="Search"
                    onClick={this.search}
                    className="btn success-btn"
                  />
                  &nbsp;&nbsp;
                  <input
                    type="button"
                    value="Clear"
                    onClick={() => {
                      $("#temp").children().css("display", "block");
                      document.getElementById("tagid").value = "";
                      document.getElementById("track-error").innerHTML = "";
                      this.flag = "false";
                    }}
                    className="btn success-btn"
                  />
                </div>

                <span
                  style={{
                    float: "right",
                    fontSize: "18px",
                    display: "none",
                    marginRight: "20px",
                  }}
                  className="sub-heading"
                  id="lastupdated"
                >
                  Last Updated : <span id="timing">00:00:00</span>{" "}
                </span>
              </div>
              <p className="error-msg" id="track-error"></p>
              <div className="row sub-heading" style={{ color: "black" }}>
                <hr></hr>
                <div className="row">
                  Total Tags :
                  <u>
                    <span id="total">0</span>
                  </u>
                </div>
              </div>
              <div>
                <div
                  id="temp"
                  style={{
                    display: "block",
                    position: "relative",
                    width: "fit-content",
                  }}
                >
                  <img id="tempimg" alt=""></img>
                </div>
              </div>
              <br></br>
              <div className="row" id="graphBlock" style={{ display: "none" }}>
                <hr></hr>
                <div className="sub-heading">
                  Employee Occupency for : <span id="chartID"></span>
                </div>
                <br></br>
                <div id="graph_opt" style={{ display: "flex" }}>
                  <button
                    id="opt0"
                    className="heading"
                    style={graphBtn}
                    onClick={() => this.dailyData("opt0")}
                  >
                    Daily Count
                  </button>
                  <button
                    id="opt1"
                    className="heading"
                    style={graphBtn}
                    onClick={() => this.weeklyReport("opt1")}
                  >
                    Weekly Count
                  </button>
                  <button
                    id="opt2"
                    className="heading"
                    style={graphBtn}
                    onClick={() => this.monthlyReport("opt2")}
                  >
                    Monthly Count
                  </button>
                </div>
                <br></br>
                <div id="chartCanvas"></div>
              </div>
              <div
                id="graph_pdf"
                className="row"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
          {/* Display modal to display error messages */}
          <div id="tracking_displayModal" className="modal">
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
        </div>
      </Fragment>
    );
  }
}

export default Tracking;
