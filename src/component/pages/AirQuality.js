import axios from "axios";
import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import {
  dailyIAQData,
  floorMap,
  irqSensor,
  monthlyIAQData,
  weeklyIAQData,
} from "../../urls/apis";
import $ from "jquery";
import { linkClicked } from "../navbar/Navbar";
import Chart from "chart.js/auto";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
  zIndex: "-1",
};
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


class AirQuality extends Component {
  // local variable
  fWidth = 0;
  fHeight = 0;
  jsonData = [];
  interval = "";
  c = 0;
  xpixel = 0;
  flag = "false";
  floorData = [];

  /** Method is called on Component Load */
  componentDidMount() {
    linkClicked(3);
    // api call on componet load to get all floor maps registered
    axios({
      method: "GET",
      url: floorMap,
      headers: {
        "content-type": "multipart/form-data",
      },
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          $("#temp-error").text("");
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
            $("#temp-error").text("Please upload a floormap.");
          }
        } else {
          $("#temp-error").text("Unable to get Floor Map.");
        }
      })
      .catch((error) => {
        console.log("floorBlock error======>",error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  componentWillUnmount = () => {
    clearInterval(this.sensor_interval);
  };

  optionChange = (btnId) => {
    $("#opt0").css({ background: "none", color: "#000" });
    $("#opt1").css({ background: "none", color: "#000" });
    $("#opt2").css({ background: "none", color: "#000" });
    console.log("----->", btnId);
    $("#" + btnId).css({ background: "rgb(0, 98, 135)", color: "#FFF" });
  };


  plotFloorMap = () => {
    let floorID = $("#fname").val();
    this.fimage = this.floorData[floorID];
    this.fWidth = this.fimage.width;
    this.fHeight = this.fimage.height;
    $("#tempimg").attr("src", this.fimage.image);
    $("#tempimg").attr("style", "width:auto;height:auto;");
    $("#lastupdated").css("display", "none");
    $("#temp").children("div").remove();
    $("#tempChart").remove();
    $("#temp .circle").remove();
    $("#graphBlock").css("display", "none");
    $("input[type=text]").val("");
    this.timeout = setTimeout(() => {
      $("#temp .circle").remove();
      this.floorDisplay();
      this.plotSensors();
    }, 2 * 1000);
    clearInterval(this.sensor_interval);
    this.sensor_interval = setInterval(this.plotSensors, 15 * 1000);
  };

  floorDisplay = () => {
    console.log("floorDisplay=======");
    this.wp = document.getElementById("temp").clientWidth;
    this.hp = document.getElementById("temp").clientHeight;
    $("#tempimg").attr(
      "style",
      "width:" + this.wp + "px;height:" + this.hp + "px;"
    );
  };

  plotSensors = () => {
    let fname = $("#fname").val();
    console.log(this.wp, "==========", this.hp);
    $("#total").text("0");
    $("#temp-error").text("");
    $("#temp .circle").remove();
    axios({
      method: "GET",
      url: irqSensor + "?floorid=" + this.floorData[fname].id,
    })
      .then((response) => {
        console.log("PlotSensors====>", response);
        let wpx = this.wp / this.fWidth;
        let hpx = this.hp / this.fHeight;
        if (response.status === 200) {
          $("#temp .circle").remove();
          let data = response.data;
          if (data.length !== 0) {
            $("#lastupdated").css("display", "block");
            let ind = 0;
            let totaltags = 0;
            for (let i in data) {
              let bgColor = "#581845";
              totaltags = totaltags + 1;
              if (data[i].tvoc >= 0 && data[i].tvoc <= 50) bgColor = "green";
              else if (data[i].tvoc >= 51 && data[i].tvoc <= 100)
                bgColor = "#1dfa02";
              else if (data[i].tvoc >= 101 && data[i].tvoc <= 150)
                bgColor = "yellow";
              else if (data[i].tvoc >= 151 && data[i].tvoc <= 200)
                bgColor = "orange";
              else if (data[i].tvoc >= 201 && data[i].tvoc <= 250)
                bgColor = "red";
              else if (data[i].tvoc >= 251 && data[i].tvoc <= 350)
                bgColor = "#900c3f";
              var iaq = document.createElement("i");
              $(iaq).attr("class", "circle");
              $(iaq).attr("id", data[i].macid);
              $(iaq).on("click", () => {
                this.getGraphData(data[i].macid);
              });
              $(iaq).attr(
                "style",
                "background:" +
                bgColor +
                ";cursor:pointer; padding:5px; position:absolute;  left:" +
                data[i].x * wpx +
                "px; top:" +
                data[i].y * hpx +
                "px;"
              );
              $(iaq).attr("title", data[i].macid);
              $("#temp").append(iaq);
            }
            $("#total").text(totaltags);
            $("#timing").text(data[ind].lastseen.substring(0, 19).replace("T", " "));
          } else {
            $("#temp-error").text(
              "No Asset is turned on, Please check System Health Page."
            );
          }
        } else {
          $("#temp-error").text("Unable to get Tags Data.");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  getGraphData = (id) => {
    $("#temp-error").text("");
    this.optionChange("opt0");
    $("#tempChart").remove();
    $("#graphBlock").css("display", "none");
    axios({
      method: "GET",
      url: dailyIAQData + "?macaddress=" + id,
    })
      .then((response) => {
        console.log("DATA====>" , response);
        if (response.status === 200) {
          if (response.data.length !== 0) {
            $("#graphBlock").css("display", "block");
            $("#chartID").text(id);
            let data = response.data;
            var timing = [],
              co = [],
              tvoc = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(data[i].timestamp.substr(11, 5));
              co.push(data[i].co2);
              tvoc.push(data[i].tvoc);
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
                    label: "CO2",
                    data: co,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "IAQ Index",
                    data: tvoc,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 1,
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
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#temp-error").text("No data found.");
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  dailyReport = (btnId) => {
    $("#temp-error").text("");
    this.optionChange(btnId);
    $("#tempChart").remove();
    $("#graph_opt").children("div").css("text-decoration", "none");
    $("#graph_opt").children("div").eq(0).css("text-decoration", "underline");
    axios({
      method: "GET",
      url: dailyIAQData + "?macaddress=" + $("#chartID").text(),
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            let data = response.data;
            var timing = [],
              co = [],
              tvoc = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(data[i].timestamp.substr(11, 5));
              co.push(data[i].co2);
              tvoc.push(data[i].tvoc);
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
                    label: "CO2",
                    data: co,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "IAQ Index",
                    data: tvoc,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 1,
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
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        // console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#temp-error").text("No data found.");
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  weeklyReport = (btnId) => {
    $("#temp-error").text("");
    this.optionChange(btnId);
    $("#tempChart").remove();
    $("#graph_opt").children("div").css("text-decoration", "none");
    $("#graph_opt").children("div").eq(1).css("text-decoration", "underline");
    axios({
      method: "GET",
      url: weeklyIAQData + "?macaddress=" + $("#chartID").text(),
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            let data = response.data;
            var timing = [],
              co = [],
              tvoc = [];
            for (let i = 0; i < data.length; i++) {
              co.push(data[i].co2);
              tvoc.push(data[i].tvoc);
              timing.push(
                data[i].timestamp.substr(8, 2) +
                " " +
                data[i].timestamp.substr(11, 5)
              );
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
                    label: "CO2",
                    data: co,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "IAQ Index",
                    data: tvoc,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 1,
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
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        // console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#temp-error").text("No data found.");
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  monthlyReport = (btnId) => {
    $("#temp-error").text("");
    $("#tempChart").remove();
    this.optionChange(btnId);
    $("#graph_opt").children("div").css("text-decoration", "none");
    $("#graph_opt").children("div").eq(2).css("text-decoration", "underline");
    axios({
      method: "GET",
      url: monthlyIAQData + "?macaddress=" + $("#chartID").text(),
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            let data = response.data;
            var timing = [],
              co = [],
              tvoc = [];
            for (let i = 0; i < data.length; i++) {
              timing.push(data[i].timestamp.substr(0, 10));
              co.push(data[i].co2);
              tvoc.push(data[i].tvoc);
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
                    label: "CO2",
                    data: co,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "IAQ Index",
                    data: tvoc,
                    backgroundColor: "green",
                    borderColor: "green",
                    borderWidth: 2,
                    pointRadius: 1,
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
        if ($("#chartCanvas").children().length !== 0) $("#tempChart").remove();
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#temp-error").text("No data found.");
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#report-displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Air Quality Parameters</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">AIR QUALITY PARAMETERS</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}>
            <div className="row">
              {/* Input field for Tag MAC ID */}
              <div className="input-group">
                <span className="label">Floor Name : </span>
                <select
                  name="type"
                  id="fname"
                  onChange={() => {
                    this.plotFloorMap();
                  }}
                ></select>
                <span
                  style={{ float: "right", fontSize: "18px", display: "none", marginTop:"20px" }}
                  className="sub-heading"
                  id="lastupdated"
                >
                  Last Updated : <span id="timing">00:00:00</span>
                </span>
              </div>
            </div>
            {/* Element for displaying error message */}
            <p className="error-msg" id="temp-error"></p>
            <div id="floorBlock" style={{ display: "none" }}>
              <div className="row">
                <hr></hr>
              </div>
              <div className="row sub-heading" style={{ color: "black" }}>
                <div className="row">
                  Total Sensors :{" "}
                  <u>
                    <span id="total">0</span>
                  </u>
                </div>
                <br></br>
                <div className="row sub-heading" style={{ fontSize: "1.2vw" }}>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "green",
                      display: "inline-block",
                      marginRight: "10px",
                    }}
                  ></div>
                  Excellent
                  <div style={{ display: "inline" }}> ( 0-50 )</div>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "#1DFA02",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Good
                  <div style={{ display: "inline" }}>( 51-100 )</div>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "yellow",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Lightly Polluted
                  <div style={{ display: "inline" }}> ( 101-150 )</div>
                </div>

                <div className="row sub-heading" style={{ fontSize: "1.2vw" }}>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "orange",
                      display: "inline-block",
                      marginRight: "10px",
                    }}
                  ></div>
                  Moderately Polluted
                  <div style={{ display: "inline" }}> ( 151-200 )</div>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "red",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Heavily Polluted
                  <div style={{ display: "inline" }}>( 201-250 )</div>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "#900C3F ",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Severely Polluted
                  <div style={{ display: "inline" }}> ( 251-350 )</div>
                </div>

                <div className="row sub-heading" style={{ fontSize: "1.2vw" }}>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "#581845",
                      display: "inline-block",
                      marginRight: "10px",
                    }}
                  ></div>
                  Extremely Polluted
                  <div style={{ display: "inline" }}> ( &gt; 350 )</div>
                </div>
              </div>
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
              {/* Block for displaying graph */}
              <br></br>
              <div className="row" id="graphBlock" style={{ display: "none" }}>
                <hr></hr>
                <div className="sub-heading">
                  IAQ Sensor ID : <span id="chartID"></span>
                </div>
                <br></br>
                <div id="graph_opt" style={{ display: "flex" }}>
                  <button
                    id="opt0"
                    className="heading"
                    style={graphBtn}
                    onClick={() => this.dailyReport("opt0")}
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
            </div>
          </div>
          {/* Display modal to display error messages */}
          <div id="thermalDisplayModal" className="modal">
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

export default AirQuality;
