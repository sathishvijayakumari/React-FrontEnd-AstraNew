import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { linkClicked } from "../navbar/Navbar";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import {
  employeeTracking,
  floorMap,
  panicAlert,
  zoneConfiguration,
  zoneMontylyTracking,
  zoneTrakcing,
  zoneWeeklyTracking,
} from "../../urls/apis";
import Chart from "chart.js/auto";
import html2pdf from "html2pdf.js";

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
  zIndex: "-1",
};

class Tracking extends Component {
  // local variable
  fWidth = 0;
  fHeight = 0;
  jsonData = [];
  interval = "";
  panicinterval = "";
  c = 0;
  xpixel = 0;
  flag = "false";
  floorData = [];

  /** Method is called on Component Load.
   * Getting floor maps list and added to dropdown list
   */
  componentDidMount() {
    linkClicked(1);
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
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#floor-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  /** On component unmount clear the interval */
  componentWillUnmount() {
    clearInterval(this.interval);
    // clearInterval(this.panicinterval);
  }

  /** Method to display floor map image on selecting floor name */
  plotFloorMap = () => {
    let floorID = $("#fname").val(); // Getting the id of floor map from select list to get particular floor data
    this.fimage = this.floorData[floorID]; // Getting the floor map details(name, height, width, path) for selected id
    this.fWidth = this.fimage.width; // Width of the floor
    this.fHeight = this.fimage.height; // Height of the floor
    $("#tempimg").attr(
      "src",
      this.fimage.image.substring(8, this.fimage.image.length)
    );
    // Setting the pixel for 1m based on floor map width
    if (this.fWidth > 0 && this.fWidth <= 20) this.xpixel = 50;
    else if (this.fWidth > 20 && this.fWidth <= 40) this.xpixel = 30;
    else if (this.fWidth > 40 && this.fWidth <= 80) this.xpixel = 20;
    else if (this.fWidth > 80 && this.fWidth <= 120) this.xpixel = 10;
    else this.xpixel = 8;
    // Setting maximum width for floor map based on floor map width
    if (this.fWidth > 0 && this.fWidth <= 20) {
      this.maxWidth = this.fimage.width * 100;
    } else if (this.fWidth > 20 && this.fWidth <= 40) {
      this.maxWidth = this.fimage.width * 60;
    } else if (this.fWidth > 40 && this.fWidth <= 80) {
      this.maxWidth = this.fimage.width * 40;
    } else if (this.fWidth > 80 && this.fWidth <= 120) {
      this.maxWidth = this.fimage.width * 20;
    } else {
      this.maxWidth = this.fimage.width * 10;
    }
    let w = $("#tempimg").css("width"); // Fetching actual width of image in pixels
    let h = $("#tempimg").css("height"); // Fetching actual height of image in pixels
    this.c = parseFloat(w) / parseFloat(h); // Calcualting ratio of floor map
    // Calculating default width and height of floor map image
    this.minImgWidth = this.fWidth * this.xpixel;
    this.minImgHeight = this.minImgWidth / this.c;
    this.maxHeight = this.maxWidth / this.c;
    // Setting width and height property of floor map image div
    $("#temp").css("width", this.minImgWidth);
    $("#temp").css("height", this.minImgHeight);
    // Setting maximum  width and height for floor map image for zoom effect
    $("#temp").css("max-width", this.maxWidth);
    $("#temp").css("max-height", this.maxHeight);
    // Setting  minimum width and height for floor map image for zoom effect
    $("#temp").css("min-width", this.minImgWidth);
    $("#temp").css("min-height", this.minImgHeight);
    $("#tempimg").attr("style", "width:100%; height:100%;");

    $("#lastupdated").css("display", "none");
    $("#temp").children("div").remove();
    $("input[type=text]").val("");
    // Calling method to plot tags on map
    this.getZones();
    this.plotAssets();
    // timer function for refreshing each 5 seconds
    clearInterval(this.interval);
    this.interval = setInterval(this.plotAssets, 10 * 1000);
    // clearInterval(this.panicinterval);
    // this.panicinterval = setInterval(this.panicFunction, 5 * 1000);
  };

  /** Getting all zone for particular floor and marking them on floor map image */
  getZones = () => {
    let floorID = $("#fname").val();
    axios({
      method: "GET",
      url: zoneConfiguration + "?floorid=" + this.floorData[floorID].id,
    })
      .then((response) => {
        if (response.status === 200) {
          let wpx = document.getElementById("temp").clientWidth / this.fWidth;
          let hpx = document.getElementById("temp").clientHeight / this.fHeight;
          if (response.data.length !== 0) {
            let data = response.data;
            for (let i = 0; i < data.length; i++) {
              let xaxis = 0,
                yaxis = 0;
              xaxis = parseInt(wpx * parseFloat(data[i].x1)) - 1;
              yaxis = parseInt(hpx * parseFloat(data[i].y1)) - 1;
              let xpadding = Math.ceil((data[i].x2 - data[i].x1) * wpx);
              let ypadding = Math.ceil((data[i].y2 - data[i].y1) * hpx);
              let childDiv1 = document.createElement("div");
              $(childDiv1).attr("id", data[i].zonename);
              $(childDiv1).attr("title", "ZoneName: " + data[i].zonename);
              $(childDiv1).attr(
                "style",
                // "background-image : url(../images/Icons/Temp_Icon.png); background-size:cover; " +
                "border:0.5px solid black; background-color:rgb(0,0,0,0.1); position: absolute; cursor: pointer; left:" +
                  xaxis +
                  "px; top:" +
                  yaxis +
                  "px; padding:" +
                  ypadding / 2 +
                  "px " +
                  xpadding / 2 +
                  "px;"
              );
              $(childDiv1).on("click", () => {
                this.getDailyData(data[i].zonename, this.floorData[floorID].id);
              });
              $("#temp").append(childDiv1);
            }
            this.dummy(data);
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
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  dummy = (zonename) => {
    let floorID = $("#fname").val();
    for (let i in zonename) {
      axios({
        method: "POST",
        url: zoneTrakcing,
        data: {
          floorid: this.floorData[floorID].id,
          zonename: zonename[i].zonename,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            // $("#graphBlock").css("display", "block");
            // $("#chartID").text(zonename[i].zonename);
            if (response.data.length !== 0) {
              let data = response.data;
              var timing = [],
                count = [];
              for (let i = 0; i < data.length; i++) {
                timing.push(data[i].timestamp);
                count.push(data[i].count);
              }
              // <div style={{ border: "4px double gray", padding: "0px 30px" }}>
              //   <div className="sub-heading">
              //     <p>Zone Name : </p>
              //     <p>Floor Name : </p>
              //     <p>Date/time : </p>
              //     <p>Description : Zone wise employee count</p>
              //   </div>
              //   <hr></hr>
              //   <div id="zone"></div>
              // </div>;

              var tit = document.createElement("div");
              $(tit).attr("class", "sub-heading");
              $(tit).append(
                "<p>Floor Name : " + this.floorData[floorID].name + "</p>"
              );
              $(tit).append("<p>Zone Name : " + zonename[i].zonename + "</p>");
              $(tit).append("<p>Date time : " + new Date() + "</p>");
              $(tit).append("<p>Description : Zone wise employee count</p>");
              var cnvs = document.createElement("canvas");
              $(cnvs).attr("id", i);
              $(cnvs).attr("width", "50px");
              $(cnvs).attr("height", "23px");
              var out = document.createElement("div");
              $(out).attr(
                "style",
                "padding: 0px 30px 10px; margin-bottom:20px"
              );
              $(out).append(tit);
              $(out).append("<hr />");
              $(out).append(cnvs);
              // $(out).css("padding", "10px");
              // $(out).append("<br />");
              // $(out).append("<br /><br />");
              // $(out).append("<br />");
              $("#graph_pdf").append(out);
              // chart displaying code
              $("#zone").append(cnvs);
              const tempChart = $("#" + i);
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
                    xAxes: [
                      {
                        title: {
                          display: true,
                          text: "Timestamp",
                          font: {
                            size: 15,
                          },
                        },
                        ticks: { display: true },
                      },
                    ],
                    yAxes: [
                      {
                        title: {
                          display: true,
                          text: "Count",
                          font: {
                            size: 15,
                          },
                        },
                        ticks: { beginAtZero: true, min: 0, stepSize: 50 },
                      },
                    ],
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: "top",
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
        });
    }
  };

  downloadpdf = () => {
    var opt = {
      margin: 0.5,
      filename: "table.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 1,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "l",
      },
    };
    html2pdf().from(document.getElementById("graph_pdf")).set(opt).save();
  };

  /** Getting employee count for particular floor map on daily bases
   * displaying information in graph format
   */
  getDailyData = (zonename, floorid) => {
    $("#graphBlock").css("display", "none");
    $("#track-error").text("");
    axios({
      method: "POST",
      url: zoneTrakcing,
      data: { floorid: floorid, zonename: zonename },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            $("#graphBlock").css("display", "block");
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
                    pointRadius: 2,
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
          $("#tracking_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Daily tracking data for paricular zone already selected  */
  dailyData = () => {
    $("#track-error").text("");
    let floorID = $("#fname").val();
    axios({
      method: "POST",
      url: zoneTrakcing,
      data: {
        floorid: this.floorData[floorID].id,
        zonename: $("#chartID").text(),
      },
    })
      .then((response) => {
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
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Weekly tracking data for paricular zone already selected  */
  weeklyReport = () => {
    $("#track-error").text("");
    let floorID = $("#fname").val();
    axios({
      method: "POST",
      url: zoneWeeklyTracking,
      data: {
        floorid: this.floorData[floorID].id,
        zonename: $("#chartID").text(),
      },
    })
      .then((response) => {
        if (response.status === 200) {
          if (response.data.length !== 0) {
            console.log(response);
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
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Monthly tracking data for paricular zone already selected  */
  monthlyReport = () => {
    $("#track-error").text("");
    let floorID = $("#fname").val();
    axios({
      method: "POST",
      url: zoneMontylyTracking,
      data: {
        floorid: this.floorData[floorID].id,
        zonename: $("#chartID").text(),
      },
    })
      .then((response) => {
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
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** Plots all tags on the floor map */
  plotAssets = () => {
    // API call to get tags data
    let fname = $("#fname").val();
    $("#total").text("0");
    axios({
      method: "GET",
      url: employeeTracking + "?floorid=" + this.floorData[fname].id,
    })
      .then((response) => {
        if (response.status === 200) {
          $("#track-error").text("");
          let data = response.data;
          if (data.length !== 0) {
            let wpx = document.getElementById("temp").clientWidth / this.fWidth;
            let hpx =
              document.getElementById("temp").clientHeight / this.fHeight;
            $("#lastupdated").css("display", "block");
            let search_id = $("#tagid").val();
            // Removing already plotted tags on floor map
            $(".empls").remove();
            // Iterating through all tags
            let ind = 0;
            let totaltags = 0;
            if (this.flag === "true") {
              for (let i = 0; i < data.length; i++) {
                // creating date object
                let timestamp =
                  new Date() -
                  new Date(
                    data[i].tagid.lastseen.substring(0, 10) +
                      " " +
                      data[i].tagid.lastseen.substring(11, 19)
                  );
                // comparing timestamp to get timeinterval
                if (timestamp <= 2 * 60 * 1000) {
                  this.jsonData = [
                    ...this.jsonData,
                    {
                      id: data[i].tagid.tagid,
                      x: data[i].tagid.x,
                      y: data[i].tagid.y,
                    },
                  ];
                  // Checking for the search mac id in the list of all asset data
                  if (data[i].tagid.tagid === search_id) {
                    ind = i;
                    let childDiv1 = document.createElement("div");
                    $(childDiv1).attr("id", data[i].tagid.tagid);
                    $(childDiv1).attr("class", "empls");
                    $(childDiv1).attr(
                      "title",
                      "Employee Name  : " +
                        data[i].name +
                        "\nTagid : " +
                        data[i].tagid.tagid
                    );
                    $(childDiv1).attr(
                      "style",
                      "position: absolute; cursor: pointer; left:" +
                        wpx * parseFloat(data[i].tagid.x) +
                        "px; top:" +
                        (parseInt(hpx * parseFloat(data[i].tagid.y)) - 20) +
                        "px;"
                    );
                    let icon = document.createElement("i");
                    $(icon).attr("class", "fa fa-street-view");
                    $(icon).attr("style", "font-size: 25px");
                    $(childDiv1).append(icon);
                    $("#temp").append(childDiv1);
                    break;
                  }
                }
              }
            } else {
              for (let i = 0; i < data.length; i++) {
                let timestamp =
                  new Date() -
                  new Date(
                    data[i].tagid.lastseen.substring(0, 10) +
                      " " +
                      data[i].tagid.lastseen.substring(11, 19)
                  );
                // comparing timestamp to get timeinterval
                if (timestamp <= 2 * 60 * 1000) {
                  this.jsonData = [
                    ...this.jsonData,
                    {
                      id: data[i].tagid.tagid,
                      x: data[i].tagid.x,
                      y: data[i].tagid.y,
                    },
                  ];
                  totaltags = totaltags + 1;
                  ind = i;
                  let childDiv1 = document.createElement("div");
                  $(childDiv1).attr("id", data[i].tagid.tagid);
                  $(childDiv1).attr(
                    "title",
                    "Employee Name  : " +
                      data[i].name +
                      "\nTagid : " +
                      data[i].tagid.tagid
                  );
                  $(childDiv1).attr(
                    "style",
                    "position: absolute; cursor: pointer; left:" +
                      wpx * parseFloat(data[i].tagid.x) +
                      "px; top:" +
                      (parseInt(hpx * parseFloat(data[i].tagid.y)) - 20) +
                      "px;"
                  );
                  let icon = document.createElement("i");
                  $(icon).attr("class", "fa fa-street-view");
                  $(icon).attr("style", "font-size: 25px");
                  $(childDiv1).append(icon);
                  $("#temp").append(childDiv1);
                }
              }
              $("#total").text(totaltags);
            }
            $("#timing").text(
              data[ind].tagid.lastseen.substring(0, 10) +
                " " +
                data[ind].tagid.lastseen.substring(11, 19)
            );
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
        console.log(error);
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#track-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** For panic alter highlights employee location on particular floor */
  panicFunction = () => {
    // finding out the panic tags
    axios({
      method: "GET",
      url: panicAlert,
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          let currTime = new Date();
          if (response.data.length !== 0) {
            let panicData = response.data;
            for (let i = 0; i < panicData.length; i++) {
              let timestamp = new Date(
                panicData[i].timestamp.substring(0, 10) +
                  " " +
                  panicData[i].timestamp.substring(11, 19)
              );
              if (currTime - timestamp <= 30 * 1000) {
                if ($("#" + panicData[i].asset.macAddress).length === 1) {
                  $("#" + panicData[i].asset.macAddress).attr(
                    "class",
                    "panicIcon blink"
                  );
                }
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#tracking_displayModal").css("display", "block");
          $("#content").text(
            "User Session has timed out.<br> Please Login again"
          );
        } else {
          $("#track-error").text(
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
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x - 16
      );
      // Changing y coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y -
          20
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y -
          16
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
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "left",
        (parseFloat(myImg.clientWidth) / this.fWidth) * this.jsonData[i].x - 16
      );
      // Changing y coordinate of tag
      $("#" + this.jsonData[i].id).css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y -
          20
      );
      $("#" + this.jsonData[i].id + "tag").css(
        "top",
        (parseFloat(myImg.clientHeight) / this.fHeight) * this.jsonData[i].y -
          16
      );
    }
  };

  /** Method to search tag plotted on floor map */
  search = () => {
    let id = $("#tagid").val();
    $("#track-error").text("");
    if (id.length === 0) {
      $("#track-error").text("Please enter Employee Tag ID.");
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#track-error").text("Invalid Tag ID entered.");
    } else if (id.length !== 0 && $("#" + id).length === 1) {
      this.flag = "true";
      $("#temp").children("div").css("display", "none");
      $("#" + id).css("display", "block");
      $("#" + id + "tag").css("display", "block");
    } else {
      $("#track-error").text("Asset Not Found.");
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

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#tracking_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLogin(0);
  };

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Realtime Tracking</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">REALTIME TRACKING</span>
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
            <p className="error-msg" id="floor-error"></p>
            <div id="floorBlock" style={{ display: "none" }}>
              {/* <div className="row"><hr></hr></div> */}
              <div className="row">
                {/* Input field for Tag MAC ID */}
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
                {/* Button to search for tag */}
                <div className="input-group">
                  <input
                    type="button"
                    value="Search"
                    onClick={this.search}
                    className="btn success-btn"
                  />
                  &nbsp;&nbsp;
                  {/* Button to clear serach data */}
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
                {/* Element for displaying error message */}
                <p className="error-msg" id="track-error"></p>
              </div>
              <button className="btn btn-success" onClick={this.downloadpdf}>
                Download PDF
              </button>
              <div className="row sub-heading" style={{ color: "black" }}>
                <hr></hr>
                <div className="row">
                  Total Tags :{" "}
                  <u>
                    <span id="total">0</span>
                  </u>
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
                  onWheel={this.hadleMouseWheel}
                >
                  <img id="tempimg" alt=""></img>
                </div>
              </div>

              <br></br>
              <div className="row" id="graphBlock" style={{ display: "none" }}>
                <hr></hr>
                <div className="sub-heading">
                  Employee Count for Zone : <span id="chartID"></span>
                </div>
                <br></br>
                <div className="sub-heading" style={{ color: "lightgray" }}>
                  <div
                    style={{
                      display: "inline-block",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
                    onClick={this.dailyData}
                  >
                    Daily Count
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
                    onClick={this.weeklyReport}
                  >
                    Weekly Count
                  </div>
                  <div
                    style={{ display: "inline-block", cursor: "pointer" }}
                    onClick={this.monthlyReport}
                  >
                    Monthly Count
                  </div>
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
