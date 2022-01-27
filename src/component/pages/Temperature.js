import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import {
  floorMap,
  dailySensorData,
  weeklySensorData,
  monthlySensorData,
  tempertureSensor,
} from "../../urls/apis";
import Chart from "chart.js/auto";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
  zIndex: "-1",
};

class Temperature extends Component {
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
    linkClicked(4);
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

  /** On component unmount clear the interval */
  componentWillUnmount() {
    clearInterval(this.thermal_interval);
  }

  /** Method to display floor map image on selecting floor name */
  plotFloorMap = () => {
    $("#graphBlock").css("display", "none");
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
    clearInterval(this.thermal_interval);
    this.thermal_interval = setInterval(this.plotSensors, 15 * 1000);
  };

  /** Highlighting sensors on the floor map */
  plotSensors = () => {
    let fname = $("#fname").val();
    $("#total").text("0");
    axios({
      method: "GET",
      url: tempertureSensor + "?floorid=" + this.floorData[fname].id,
    })
      .then((response) => {
        if (response.status === 200) {
          $("#temp-error").text("");
          let data = response.data;
          if (data.length !== 0) {
            let wpx = document.getElementById("temp").clientWidth / this.fWidth;
            let hpx =
              document.getElementById("temp").clientHeight / this.fHeight;
            $("#lastupdated").css("display", "block");
            // Removing already plotted tags on floor map
            $("#temp").children("div").remove();
            let currTime = new Date();
            let ind = 0;
            let totaltags = 0;
            // Iterating through all tags
            for (let i = 0; i < data.length; i++) {
              let timestamp = new Date(
                data[i].lastseen.substring(0, 10) +
                  " " +
                  data[i].lastseen.substring(11, 19)
              );
              if (currTime - timestamp <= 2 * 60 * 1000) {
                // Storing tags data
                this.jsonData = [
                  ...this.jsonData,
                  {
                    id: data[i].macid,
                    x1: data[i].x1,
                    y1: data[i].y1,
                    x2: data[i].x2,
                    y2: data[i].y2,
                  },
                ];
                totaltags = totaltags + 1;
                ind = i;
                let childDiv = document.createElement("div");
                let xaxis = 0,
                  yaxis = 0;
                xaxis = parseInt(wpx * parseFloat(data[i].x1)) - 5;
                yaxis = parseInt(hpx * parseFloat(data[i].y1)) - 5;
                let xpadding = Math.ceil((data[i].x2 - data[i].x1) * wpx);
                let ypadding = Math.ceil((data[i].y2 - data[i].y1) * hpx);
                $(childDiv).attr("id", data[i].macid);
                $(childDiv).attr(
                  "title",
                  "\nMAC ID : " +
                    data[i].macid +
                    "\nTemperature  : " +
                    data[i].temperature +
                    "\nHumidity : " +
                    data[i].humidity
                );
                $(childDiv).attr("class", "square");
                $(childDiv).on("click", () => {
                  this.showThermalMap(data[i].macid);
                });
                if (parseFloat(data[i].temperature) < 25) {
                  var clr = 120;
                  if (parseInt(data[i].temperature) === 24) clr = 100;
                  else if (parseInt(data[i].temperature) === 23) clr = 80;
                  else if (parseInt(data[i].temperature) === 22) clr = 60;
                  else if (parseInt(data[i].temperature) === 21) clr = 40;
                  else if (parseInt(data[i].temperature) === 20) clr = 20;
                  $(childDiv).attr(
                    "style",
                    // "background-image : url(../images/Icons/Temp_Icon.png); background-size:cover; " +
                    "border:0.5px solid black; background-color:rgb(0," +
                      clr +
                      ",255,0.5); position: absolute; cursor: pointer; left:" +
                      xaxis +
                      "px; top:" +
                      yaxis +
                      "px; padding:" +
                      ypadding / 2 +
                      "px " +
                      xpadding / 2 +
                      "px;"
                  );
                } else if (
                  parseFloat(data[i].temperature) >= 25 &&
                  parseFloat(data[i].temperature) <= 30
                ) {
                  clr = 240;
                  if (parseInt(data[i].temperature) === 30) clr = 240;
                  else if (parseInt(data[i].temperature) === 29) clr = 200;
                  else if (parseInt(data[i].temperature) === 28) clr = 160;
                  else if (parseInt(data[i].temperature) === 27) clr = 120;
                  else if (parseInt(data[i].temperature) === 26) clr = 80;
                  else if (parseInt(data[i].temperature) === 25) clr = 40;
                  $(childDiv).attr(
                    "style",
                    // "background-image : url(../images/Icons/Temp_Icon.png); background-size:cover; " +
                    "border:0.5px solid black; background-color:rgb(0,255," +
                      clr +
                      ",0.5); position: absolute; cursor: pointer; left:" +
                      xaxis +
                      "px; top:" +
                      yaxis +
                      "px; padding:" +
                      ypadding / 2 +
                      "px " +
                      xpadding / 2 +
                      "px;"
                  );
                } else if (parseFloat(data[i].temperature) > 30) {
                  clr = 250;
                  if (parseInt(data[i].temperature) === 35) clr = 250;
                  else if (parseInt(data[i].temperature) === 34) clr = 200;
                  else if (parseInt(data[i].temperature) === 33) clr = 150;
                  else if (parseInt(data[i].temperature) === 32) clr = 100;
                  else if (parseInt(data[i].temperature) === 31) clr = 50;
                  $(childDiv).attr(
                    "style",
                    // "background-image : url(../images/Icons/Temp_Icon.png); background-size:cover; " +
                    "border:0.5px solid black; background-color: rgb(255, " +
                      clr +
                      ", 0, 0.5); position: absolute; cursor: pointer; left:" +
                      xaxis +
                      "px; top:" +
                      yaxis +
                      "px; padding:" +
                      ypadding / 2 +
                      "px " +
                      xpadding / 2 +
                      "px;"
                  );
                }
                $("#temp").append(childDiv);
              }
            }
            $("#total").text(totaltags);
            $("#timing").text(
              data[ind].lastseen.substring(0, 10) +
                " " +
                data[ind].lastseen.substring(11, 19)
            );
            if ($("#temp").children("div").length === 0) {
              $("#temp-error").text("No asset detected.");
            } else {
              $("#temp-error").text("");
            }
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

  /** Zoomin the floor map image on button click */
  zoomin = () => {
    // Changes the image width and height
    var myImg = document.getElementById("temp");
    var currWidth = myImg.clientWidth;
    myImg.style.width = currWidth + this.xpixel + "px";
    myImg.style.height = parseFloat(myImg.style.width) / this.c + "px";

    // Changes the tag position based on floor map size
    // Iterating through all the tags plotted on floor map
    for (let i = 0; i < this.jsonData.length; i++) {
      // Changing x coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x - 5
      );
      // Changing y coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y - 5
      );
    }
  };

  /** Zoomout the floor map image on button click */
  zoomout = () => {
    // Changes the image width and height
    var myImg = document.getElementById("temp");
    var currWidth = myImg.clientWidth;
    myImg.style.width = currWidth - this.xpixel + "px";
    myImg.style.height = parseFloat(myImg.style.width) / this.c + "px";

    // Changes the tag position based on floor map size
    // Iterating through all the tags plotted on floor map
    // if (parseFloat(myImg.style.width) > this.imgWidth)
    for (let i = 0; i < this.jsonData.length; i++) {
      // Changing x coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x - 5
      );
      // Changing y coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y - 5
      );
    }
  };

  /** Method to search tag plotted on floor map */
  search = () => {
    let id = $("#tagid").val();
    $("#temp-error").text("");
    if (id.length === 0) {
      $("#temp-error").text("Please enter MAC Address.");
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#temp-error").text("Invalid MAC ID entered.");
    } else if (id.length !== 0 && $("#" + id).length === 1) {
      this.flag = "true";
      $("#temp").children("div").css("display", "none");
      $("#" + id).css("display", "block");
      $("#" + id + "tag").css("display", "block");
    } else {
      $("#temp-error").text("Asset Not Found.");
    }
  };

  /** Method to zoomIn and zoomOut image on mouse scroll */
  hadleMouseWheel = (evt) => {
    if (evt.deltaY > 0) {
      this.zoomout();
    } else if (evt.deltaY < 0) {
      this.zoomin();
    }
  };

  /** Method to display temperature and humidity data in graph format */
  showThermalMap = (id) => {
    this.tagID = id; // Storing the Sensor ID in a variable
    axios({
      method: "POST",
      url: dailySensorData + id,
    })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          if (response.data.length !== 0) {
            $("#graphBlock").css("display", "block");
            $("#chartID").text(id);
            var lbl = [],
              tempData = [],
              humidData = [];
            var ct = 1;
            if (response.data.length > 100) {
              ct = Math.ceil(response.data.length / 100);
            }
            for (let i = 0; i < response.data.length; i = i + ct) {
              lbl.push(response.data[i].timestamp.substring(11, 19));
              tempData.push(response.data[i].temperature);
              humidData.push(response.data[i].humidity);
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
                labels: lbl,
                datasets: [
                  {
                    label: "Temperature",
                    data: tempData,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 0.5,
                    lineTension: 0.4,
                  },
                  {
                    label: "Humidity",
                    data: humidData,
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

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#thermalDisplayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Daily thermal data for particualr sensor */
  dailyReport = () => {
    axios({
      method: "POST",
      url: dailySensorData + this.tagID,
    })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          console.log(response);
          if (response.data.length !== 0) {
            $("#graphBlock").css("display", "block");
            $("#chartID").text(this.tagID);
            var lbl = [],
              tempData = [],
              humidData = [];
            var ct = 1;
            if (response.data.length > 100) {
              ct = Math.ceil(response.data.length / 100);
            }
            for (let i = 0; i < response.data.length; i = i + ct) {
              lbl.push(response.data[i].timestamp.substring(11, 19));
              tempData.push(response.data[i].temperature);
              humidData.push(response.data[i].humidity);
            }
            console.log(lbl.length);
            if ($("#chartCanvas").children().length !== 0)
              $("#tempChart").remove();
            var cnvs = document.createElement("canvas");
            $(cnvs).attr("id", "tempChart");
            $(cnvs).attr("width", "50px");
            $(cnvs).attr("height", "20px");
            $("#chartCanvas").append(cnvs);

            // chart displaying code
            const tempChart = document.getElementById("tempChart");
            new Chart(tempChart, {
              type: "line",
              data: {
                //Bring in data
                labels: lbl,
                datasets: [
                  {
                    label: "Temperature",
                    data: tempData,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "Humidity",
                    data: humidData,
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
          }
          window.scrollTo(0, document.body.scrollHeight);
        }
      })
      .catch((error) => {
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

  /** Weekly thermal data for particualr sensor */
  weeklyReport = () => {
    axios({
      method: "POST",
      url: weeklySensorData + this.tagID,
    })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          if (response.data.length !== 0) {
            // document.getElementById("graphBlock").style.display = "block";
            // document.getElementById("chartID").innerHTML = this.tagID;
            var lbl = [],
              tempData = [],
              humidData = [];
            var ct = 1;
            if (response.data.length > 100) {
              ct = Math.ceil(response.data.length / 100);
            }
            for (let i = 0; i < response.data.length; i = i + ct) {
              lbl.push(
                response.data[i].timestamp.substring(0, 10) +
                  " " +
                  response.data[i].timestamp.substring(11, 19)
              );
              tempData.push(response.data[i].temperature);
              humidData.push(response.data[i].humidity);
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
                labels: lbl,
                datasets: [
                  {
                    label: "Temperature",
                    data: tempData,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "Humidity",
                    data: humidData,
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
          }
          window.scrollTo(0, document.body.scrollHeight);
        }
      })
      .catch((error) => {
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

  /** Monthly thermal data for particualr sensor */
  monthlyReport = () => {
    axios({
      method: "POST",
      url: monthlySensorData + this.tagID,
    })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          if (response.data.length !== 0) {
            // document.getElementById("graphBlock").style.display = "block";
            // document.getElementById("chartID").innerHTML = this.tagID;
            var lbl = [],
              tempData = [],
              humidData = [];
            var ct = 1;
            if (response.data.length > 100) {
              ct = Math.ceil(response.data.length / 100);
            }
            for (let i = 0; i < response.data.length; i = i + ct) {
              lbl.push(response.data[i].timestamp.substring(0, 10));
              tempData.push(response.data[i].temperature);
              humidData.push(response.data[i].humidity);
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
                labels: lbl,
                datasets: [
                  {
                    label: "Temperature",
                    data: tempData,
                    backgroundColor: "red",
                    borderColor: "red",
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.4,
                  },
                  {
                    label: "Humidity",
                    data: humidData,
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
          }
          window.scrollTo(0, document.body.scrollHeight);
        }
      })
      .catch((error) => {
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

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Realtime Tracking</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">THERMAL MAP</span>
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
                <div className="row sub-heading">
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
                </div>
              </div>
              <div className="row">
                {/* Block to display floor map image */}
                <div
                  id="temp"
                  style={{
                    display: "block",
                    position: "relative",
                  }}
                  // onWheel={this.hadleMouseWheel}
                >
                  <img id="tempimg" alt=""></img>
                  <canvas
                    id="mycanvas"
                    style={{
                      position: "absolute",
                      top: "0px",
                      left: "0px",
                      width: "100%",
                      height: "100%",
                    }}
                  ></canvas>
                </div>
              </div>
              {/* Block for displaying graph */}
              <br></br>
              <div className="row" id="graphBlock" style={{ display: "none" }}>
                <hr></hr>
                <div className="sub-heading">
                  Thermal Map for Sensor ID : <span id="chartID"></span>
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

export default Temperature;
