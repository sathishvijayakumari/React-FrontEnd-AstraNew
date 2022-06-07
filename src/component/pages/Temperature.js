import React, { Component, Fragment } from "react";
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

class Temperature extends Component {
    // local variable
    fWidth = 0;
    fHeight = 0;
    interval = "";
    c = 0;
    xpixel = 0;
    flag = "false";
    floorData = [];
    constructor() {
        super();
        this.state = {
            inactive: 0
        }
    }

    /** Method is called on Component Load */
    componentDidMount() {
        linkClicked(2);
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
                    $("#content").text("User Session has timed out. Please Login again");
                } else if (error.response.status === 404) {
                    $("#temp-error").text("FloorMap data not found.");
                } else {
                    $("#temp-error").text(
                        "Request Failed with status code (" + error.response.status + ")."
                    );
                }
            });
    }

    /** On component unmount clear the interval */
    componentWillUnmount() {
        clearInterval(this.sensor_interval);
        clearTimeout(this.timeout);
    }

    plotFloorMap = () => {
        this.setState({ inactive: 0 })
        $("#temp-error").text("");
        let floorID = $("#fname").val();
        this.fimage = this.floorData[floorID];
        this.fWidth = this.fimage.width;
        this.fHeight = this.fimage.height;
        $("#tempimg").attr("src", this.fimage.image);
        $("#tempimg").attr("style", "width:auto;height:auto;");
        $("#lastupdated").css("display", "none");
        $("#temp").children("div").remove();
        $("#tempChart").remove();
        $("#temp .square").remove();
        $("#graphBlock").css("display", "none");
        $("input[type=text]").val("");
        this.timeout = setTimeout(() => {
            $("#temp .square").remove();
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

    /** Highlighting sensors on the floor map */
    plotSensors = () => {
        this.setState({ inactive: 0 });
        let fname = $("#fname").val();
        console.log(this.wp, "==========", this.hp);
        $("#temp-error").text("");
        $("#total").text("0");
        axios({
            method: "GET",
            url: tempertureSensor + "?floorid=" + this.floorData[fname].id,
        })
            .then((response) => {
                console.log("PlotSensors====>", response);
                let wpx = this.wp / this.fWidth;
                let hpx = this.hp / this.fHeight;
                if (response.status === 200) {
                    $("#temp .square").remove();
                    let data = response.data;
                    if (data.length !== 0) {
                        $("#lastupdated").css("display", "block");
                        let totaltags = 0, inactiveCount = 0;
                        for (let i = 0; i < data.length; i++) {

                            let childDiv = document.createElement("div");
                            let xaxis = 0, yaxis = 0;
                            xaxis = parseInt(wpx * parseFloat(data[i].x1));
                            yaxis = parseInt(hpx * parseFloat(data[i].y1));
                            let senWidth = Math.ceil((data[i].x2 - data[i].x1) * wpx) - 3;
                            let senHeight = Math.ceil((data[i].y2 - data[i].y1) * hpx) - 3;
                            $(childDiv).attr("id", data[i].macid);
                            if (new Date() - new Date(data[i].lastseen) <= 30 * 60 * 1000) {
                                totaltags = totaltags + 1;
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
                                        "border:0.5px solid black; background-color:rgb(0," +
                                        clr +
                                        ",255,0.5); position: absolute; cursor: pointer;" +
                                        "left:" +
                                        xaxis +
                                        "px;top:" +
                                        yaxis +
                                        "px;width:" +
                                        senWidth +
                                        "px;height:" +
                                        senHeight +
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
                                        "border:0.5px solid black; background-color:rgb(0,255," +
                                        clr +
                                        ",0.5); position: absolute; cursor: pointer; left:" +
                                        xaxis +
                                        "px;top:" +
                                        yaxis +
                                        "px;width:" +
                                        senWidth +
                                        "px;height:" +
                                        senHeight +
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
                                        "border:0.5px solid black; background-color: rgb(255, " +
                                        clr +
                                        ", 0, 0.5); position: absolute; cursor: pointer; left:" +
                                        xaxis +
                                        "px;top:" +
                                        yaxis +
                                        "px;width:" +
                                        senWidth +
                                        "px;height:" +
                                        senHeight +
                                        "px;"
                                    );
                                }
                            }
                            else {
                                inactiveCount += 1;
                                $(childDiv).attr(
                                    "title",
                                    "\nMAC ID : " +
                                    data[i].macid +
                                    "\nTemperature  : " +
                                    data[i].temperature +
                                    "\nHumidity : " +
                                    data[i].humidity +
                                    "\nLastseen : " +
                                    data[i].lastseen.substring(0, 19).replace("T", " ")
                                );
                                // $(childDiv).on("click", () => {
                                //     this.showThermalMap(data[i].macid);
                                // });
                                $(childDiv).attr("class", "square");
                                $(childDiv).attr(
                                    "style",
                                    "border:0.5px solid black; background-color: rgba(255,0, 0,0.4);" +
                                    "position: absolute; cursor: pointer; left: " +
                                    xaxis +
                                    "px;top:" +
                                    yaxis +
                                    "px;width:" +
                                    senWidth +
                                    "px;height:" +
                                    senHeight +
                                    "px;"
                                );
                            }
                            $("#temp").append(childDiv);
                        }
                        this.setState({ inactive: inactiveCount });
                        $("#total").text(totaltags);
                        $("#timing").text(data[0].lastseen.substring(0, 19).replace("T", " "));
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
                    $("#content").text("User Session has timed out. Please Login again");
                } else if (error.response.status === 404) {
                    $("#temp-error").text(
                        "No Asset is turned on, Please check System Health Page."
                    );
                } else {
                    $("#temp-error").text(
                        "Request Failed with status code (" + error.response.status + ")."
                    );
                }
            });
    };

    /** Method to display temperature and humidity data in graph format */
    showThermalMap = (id) => {
        this.optionChange("opt0");
        $("#temp-error").text("");
        $("#graphBlock").css("display", "none");
        this.tagID = id;
        axios({
            method: "POST",
            url: dailySensorData + id,
        })
            .then((response) => {
                if (response.status === 200) {
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
                    $("#content").text("User Session has timed out. Please Login again");
                } else if (error.response.status === 404) {
                    $("#temp-error").text("No Daily data found.");
                    window.scrollTo(0, 0);
                } else {
                    $("#temp-error").text(
                        "Request Failed with status code (" + error.response.status + ")."
                    );
                }
            });
    };


    /** Daily thermal data for particualr sensor */
    dailyReport = (btnId) => {
        this.optionChange(btnId);
        $("#temp-error").text("");
        $("#graph_opt").children("div").css("text-decoration", "none");
        $("#graph_opt").children("div").eq(0).css("text-decoration", "underline");
        $("#tempChart").remove();
        axios({
            method: "POST",
            url: dailySensorData + this.tagID,
        })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    // console.log(response);
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
                        // console.log(lbl.length);
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
                    $("#content").text("User Session has timed out. Please Login again");
                } else if (error.response.status === 404) {
                    $("#temp-error").text("No Daily data found.");
                    window.scrollTo(0, 0);
                } else {
                    $("#temp-error").text(
                        "Request Failed with status code (" + error.response.status + ")."
                    );
                }
            });
    };

    /** Weekly thermal data for particualr sensor */
    weeklyReport = (btnId) => {
        this.optionChange(btnId);
        $("#temp-error").text("");
        $("#graph_opt").children("div").css("text-decoration", "none");
        $("#graph_opt").children("div").eq(1).css("text-decoration", "underline");
        $("#tempChart").remove();
        axios({
            method: "POST",
            url: weeklySensorData + this.tagID,
        })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    if (response.data.length !== 0) {
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
                    $("#content").text("User Session has timed out. Please Login again");
                } else if (error.response.status === 404) {
                    $("#temp-error").text("No Weekly data found.");
                    window.scrollTo(0, 0);
                } else {
                    $("#temp-error").text(
                        "Request Failed with status code (" + error.response.status + ")."
                    );
                }
            });
    };

    /** Monthly thermal data for particualr sensor */
    monthlyReport = (btnId) => {
        this.optionChange(btnId);
        $("#temp-error").text("");
        $("#graph_opt").children("div").css("text-decoration", "none");
        $("#graph_opt").children("div").eq(2).css("text-decoration", "underline");
        $("#tempChart").remove();
        axios({
            method: "POST",
            url: monthlySensorData + this.tagID,
        })
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    if (response.data.length !== 0) {
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
                    $("#content").text("User Session has timed out. Please Login again");
                } else if (error.response.status === 404) {
                    $("#temp-error").text("No Monthly data found.");
                    window.scrollTo(0, 0);
                } else {
                    $("#temp-error").text(
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

    /** Terminate the session on forbidden (403) error */
    sessionTimeout = () => {
        $("#thermalDisplayModal").css("display", "none");
        sessionStorage.setItem("isLoggedIn", 0);
        this.props.handleLogin(0);
    };

    render() {
        const { inactive } = this.state;
        return (
            <Fragment>
                <>
                    <title>Realtime Tracking</title>
                </>
                <div className="panel">
                    <span className="main-heading">THERMAL MAP</span>
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
                                    style={{ float: "right", fontSize: "18px", display: "none" }}
                                    className="sub-heading"
                                    id="lastupdated"
                                >
                                    Last Updated : <span id="timing">00:00:00</span>{" "}
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

                                    <div
                                        className="square"
                                        style={{
                                            backgroundColor: "rgba(255,0, 0,0.7)",
                                            display: "inline-block",
                                            marginRight: "10px",
                                            marginLeft: "20px",
                                        }}
                                    ></div>Inactive ({inactive})
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
                            <br></br>
                            <div className="row" id="graphBlock" style={{ display: "none" }}>
                                <hr></hr>
                                <div className="sub-heading">
                                    Thermal Map for Sensor ID : <span id="chartID"></span>
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

export default Temperature;
