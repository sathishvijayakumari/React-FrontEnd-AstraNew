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
    linkClicked(5);
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
        console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  /** Method to display floor map image on selecting floor name */
  plotFloorMap = () => {
    $("#graphBlock").css("display", "none");
    $("#temp").children("i").remove();
    $("#temp").children("p").remove();
    let floorID = $("#fname").val(); // Getting the id of floor map from select list to get particular floor data
    this.fimage = this.floorData[floorID]; // Getting the floor map details(name, height, width, path) for selected id
    this.fWidth = this.fimage.width; // Width of the floor
    this.fHeight = this.fimage.height; // Height of the floor
    $("#tempimg").attr(
      "src",
      this.fimage.image.substring(8, this.fimage.image.length)
    );
    // Setting the pixel for 1m based on floor map width
    // Setting maximum width for floor map based on floor map width
    if (this.fWidth > 0 && this.fWidth <= 20) {
      this.xpixel = 50;
      this.maxWidth = this.fimage.width * 100;
    } else if (this.fWidth > 20 && this.fWidth <= 40) {
      this.xpixel = 30;
      this.maxWidth = this.fimage.width * 60;
    } else if (this.fWidth > 40 && this.fWidth <= 80) {
      this.xpixel = 20;
      this.maxWidth = this.fimage.width * 40;
    } else if (this.fWidth > 80 && this.fWidth <= 120) {
      this.xpixel = 10;
      this.maxWidth = this.fimage.width * 20;
    } else {
      this.xpixel = 8;
      this.maxWidth = this.fimage.width * 10;
    }
    let w = $("#tempimg").css("width"); // Fetching actual width of image in pixels
    let h = $("#tempimg").css("height"); // Fetching actual height of image in pixels
    this.c = parseFloat(w) / parseFloat(h); // Calculating ratio of floor map
    this.maxHeight = this.maxWidth / this.c;
    // Calculating default width and height for floor map image to display on page
    this.minImgWidth = this.fWidth * this.xpixel;
    this.minImgHeight = this.minImgWidth / this.c;
    // Setting width and height property of floor map image
    $("#temp").css("width", this.minImgWidth);
    $("#temp").css("height", this.minImgHeight);
    // Setting maximum and minimum width and height for floor map image for zoom effect
    $("#temp").css("min-width", this.minImgWidth);
    $("#temp").css("min-height", this.minImgHeight);
    // Setting maximum and minimum width and height for floor map image for zoom effect
    $("#temp").css("max-width", this.maxWidth);
    $("#temp").css("max-height", this.maxHeight);
    $("#tempimg").attr("style", "width:100%; height:100%;");

    $("#lastupdated").css("display", "none");
    $("#temp").children("div").remove();
    $("input[type=text]").val("");
    window.scrollTo(0, document.body.scrollHeight);
    // Calling method to plot tags on map
    this.plotSensors();
    // timer function for refreshing each 5 seconds
    // clearInterval(this.thermal_interval);
    // this.thermal_interval = setInterval(this.plotSensors, 15 * 1000);
  };

  plotSensors = () => {
    let fname = $("#fname").val();
    $("#total").text("0");
    axios({
      method: "GET",
      url: irqSensor + "?floorid=" + this.floorData[fname].id,
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            let data = response.data;
            let wpx = document.getElementById("temp").clientWidth / this.fWidth;
            let hpx =
              document.getElementById("temp").clientHeight / this.fHeight;
            for (let i in data) {
              var iaq = document.createElement("i");
              $(iaq).attr("class", "circle");
              $(iaq).attr("id", data[i].macid);
              $(iaq).on("click", () => {
                this.getGraphData(data[i].macid);
              });
              $(iaq).attr(
                "style",
                "cursor:pointer; padding:5px; position:absolute;  left:" +
                  data[i].x * wpx +
                  "px; top:" +
                  data[i].y * hpx +
                  "px;"
              );

              var p = document.createElement("p");
              $(p).text(data[i].macid);
              $(p).attr(
                "style",
                "font-size:11px; font-weight:bold; padding:2px; border:1px solid black; border-radius:5px; position:absolute; color:black; background:white; left:" +
                  data[i].x * wpx +
                  "px; top:" +
                  data[i].y * hpx +
                  "px;"
              );

              $("#temp").append(iaq);
              $("#temp").append(p);
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  getGraphData = (id) => {
    axios({
      method: "GET",
      url: dailyIAQData + "?macaddress=" + id,
    })
      .then((response) => {
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
                    label: "TVOC",
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
        console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  dailyReport = () => {
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
                    label: "TVOC",
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
        console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  weeklyReport = () => {
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
                    label: "TVOC",
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
        console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  monthlyReport = () => {
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
                    label: "TVOC",
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
        console.log(error);
        if (error.response.status === 403) {
          $("#thermalDisplayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#temp-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Air Quality Parameters</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">AIR QUALITY PARAMETERS</span>
          <span
            style={{ float: "right", fontSize: "18px", display: "none" }}
            className="sub-heading"
            id="lastupdated"
          >
            Last Updated : <span id="timing">00:00:00</span>{" "}
          </span>
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
                {/* <div className="row sub-heading">
                  <div
                    className="square"
                    style={{
                      backgroundColor: "blue",
                      display: "inline-block",
                      marginRight: "10px",
                    }}
                  ></div>
                  Cold
                  <div style={{ display: "inline" }}> ( &lt;25&deg;C )</div>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "green",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Optimum
                  <div style={{ display: "inline" }}>
                    {" "}
                    ( 25&deg;C - 30&deg;C )
                  </div>
                  <div
                    className="square"
                    style={{
                      backgroundColor: "orange",
                      display: "inline-block",
                      marginRight: "10px",
                      marginLeft: "20px",
                    }}
                  ></div>
                  Warm
                  <div style={{ display: "inline" }}> ( &gt;30&deg;C )</div>
                </div> */}
              </div>
              <div className="row">
                {/* Block to display floor map image */}
                <div
                  id="temp"
                  style={{
                    display: "block",
                    position: "relative",
                  }}
                >
                  <img id="tempimg" alt=""></img>
                </div>
              </div>
              {/* Block for displaying graph */}
              <br></br>
              <div className="row" id="graphBlock" style={{ display: "none" }}>
                <hr></hr>
                <div className="sub-heading">
                  IAQ Sensor ID : <span id="chartID"></span>
                </div>
                <br></br>
                <div className="sub-heading" style={{ color: "lightgray" }}>
                  <div
                    style={{
                      display: "inline-block",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
                    onClick={this.dailyReport}
                  >
                    Daily Report
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
                    onClick={this.weeklyReport}
                  >
                    Weekly Report
                  </div>
                  <div
                    style={{ display: "inline-block", cursor: "pointer" }}
                    onClick={this.monthlyReport}
                  >
                    Monthly Report
                  </div>
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
