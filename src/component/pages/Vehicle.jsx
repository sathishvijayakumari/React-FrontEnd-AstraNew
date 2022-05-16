import React, {Component, Fragment} from "react";
import {Helmet} from "react-helmet";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import Chart from 'chart.js/auto';
axios.defaults.xsrfHeaderName = "x-csrftoken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;


const Underline = {
    width: "75px",
    height: "9px",
    position: "absolute"
};

export default class Vehicle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lastseen: '',
            error: false,
            // message: "",
            sensorDet: [],
            loading: false,
            vehicleid: ''
        }
    }

    componentDidMount() {
        this.sensorsDetails();
        // this.interval1 = setInterval(this.sensorsDetails, 15 * 1000);
    }

    // componentWillUnmount() {
    //    clearInterval(this.interval1);
    // }

    sensorsDetails = () => {
        this.setState({sensorDet: []});
        console.log('sensorsDetails Page======>',);
        axios({method: "GET", url: '/api/vehicle/tracking'}).then((response) => {
            if (response.status === 200 || response.status === 201) {
                var dt = response.data;
                console.log('======>', response);
                if (dt.length !== 0) {
                    let datas = [];
                    for (let i = 0; i < 1; i++) {
                        let timestamp = dt.lastseen.substring(0, 19).replace("T", " ");
                        let status = "red";
                        if (new Date() - new Date(timestamp) <= 2 * 60 * 1000) {
                            status = "green";
                        }

                        datas.push({
                            sno: (1).toString(),
                            gatewayId: dt.gateway,
                            vehicleId: dt.vehicleid,
                            battery: dt.battery,
                            lastseen: timestamp,
                            status: status
                        })
                    }
                    this.setState({sensorDet: datas, vehicleid: dt.vehicleid});
                }
            }
        }).catch((error) => {
            console.log('error=====>', error);
            if (error.response.status === 403) {
                $("#sensor-displayModal").css("display", "block");
                $("#content").text("User Session has timed out.");
                $("#content1").text("Please Login again.");
            } else {
                $("#sensor_error").text("Request Failed with status code (" + error.response.status + ").");
            }
        });
    }

    /** Terminate the session on forbidden (403) error */
    sessionTimeout = () => {
        $("#sensor-displayModal").css("display", "none");
        sessionStorage.setItem("isLoggedIn", 0);
        this.props.handleLogin(0);
    };

    storeMacId = () => {
        const {vehicleid} = this.state;
        // $("#sensor_details_graph").css("display", "none");
        let display = $('#sensor_details_graph').css('display') === 'block' ? 'none' : 'block';
        console.log(display, '###################', vehicleid);

        $("#sensor_details_graph").css("display", display);
        if (display === 'block') {
            this.setState({loading: true})
            axios({
                method: "POST",
                url: '/api/vehicle/tracking',
                data: {
                    vehicleid: vehicleid
                }
            }).then((response) => {
                const data = response.data;
                console.log('Response ======>', response.data);
                if (data.length !== 0 && response.status === 200) {
                    var lbl = [],
                        tempData = [],
                        ct = 1;
                    if (data.length > 100) {
                        ct = Math.ceil(data.length / 100);
                    }
                    lbl.push(data[0].lastseen.substring(11, 16));
                    tempData.push('0');
                    for (let i = 0; i < data.length; i = i + ct) {
                        lbl.push(data[i].lastseen.substring(11, 16));
                        tempData.push(data[i].temperature);
                    }


                    $("#sensor_details_graph").css("display", "block");
                    $("#chartID").text(vehicleid);
                    if ($("#daily_chart").children().length !== 0) 
                        $("#tempChart").remove();
                    


                    var cnvs = document.createElement("canvas");
                    $(cnvs).attr("id", "tempChart");
                    $(cnvs).attr("width", "50px");
                    $(cnvs).attr("height", "20px");
                    $("#daily_chart").append(cnvs);
                    // chart displaying code
                    const tempChart = $("#tempChart");
                    new Chart(tempChart, {
                        type: "line",
                        data: {
                            labels: lbl,
                            datasets: [
                                {
                                    label: "Temperature",
                                    data: tempData,
                                    backgroundColor: "red",
                                    borderColor: "red",
                                    borderWidth: 2,
                                    pointRadius: 0.5,
                                    lineTension: 0.4
                                },
                            ]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                xAxes: [
                                    {
                                        ticks: {
                                            display: true
                                        }
                                    }
                                ],
                                yAxes: [
                                    {
                                        ticks: {
                                            beginAtZero: true,
                                            min: 0,
                                            stepSize: 50
                                        }
                                    }
                                ]
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    position: "right",
                                    fontSize: 35,
                                    fontWeight: "bold"
                                }
                            }
                        }
                    });
                    this.setState({loading: false});
                } else {
                    $("#report-error").text("No data found on Vehicle ID : " + vehicleid);
                    this.setState({loading: false});
                }
            }).catch((error) => {
                this.setState({loading: false});
                console.log("Graph Error====>", error);
                if (error.response.status === 403) {
                    $("#report-displayModal").css("display", "block");
                    $("#content").text("User Session has timed out.");
                    $("#content1").text("Please Login again.");
                } else {
                    $("#report-error").text("Request Failed with status code (" + error.response.status + ").");
                }
            })
        }
    }


    /** Redern the html content on the browser */
    render() {
        const {sensorDet} = this.state;
        return (
            <Fragment>
                <>
                    <title>Vehicle Details</title>
                </>
                <div className="panel">
                    <span className="main-heading">Vehicle Details</span><br/>
                    <img alt="" src="../images/Tiles/Underline.png"
                        style={Underline}/>
                    <div className="container fading">
                        <p className="error-msg" id="sensor_error"></p>
                        <div className="container">

                            {/* Table displays Sensor tags registered */}
                            <table style={
                                {
                                    marginTop: "20px",
                                    marginBottom: "30px"
                                }
                            }>
                                <thead>
                                    <tr>
                                        <th>Sl.No</th>
                                        <th>GATEWAY ID</th>
                                        <th>VEHICLE ID</th>
                                        <th>BATTERY</th>
                                        <th>LAST SEEN</th>
                                        <th>Status</th>
                                        <th>Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="sensorTable">
                                    {
                                    sensorDet.map((item, index) => (
                                        <tr key={index}>
                                            <td>{
                                                item.sno
                                            }</td>
                                            <td>{
                                                item.gatewayId
                                            }</td>
                                            <td>{
                                                item.vehicleId
                                            }</td>
                                            <td>{
                                                item.battery
                                            }</td>
                                            <td>{
                                                item.lastseen
                                            }</td>
                                            <td>{
                                                item.status === "red" ? (
                                                    <div className='circle'
                                                        style={
                                                            {
                                                                margin: 'auto',
                                                                backgroundColor: "red"
                                                            }
                                                    }></div>
                                                ) : (
                                                    <div className='circle'
                                                        style={
                                                            {
                                                                margin: 'auto',
                                                                backgroundColor: "green"
                                                            }
                                                    }></div>
                                                )
                                            } </td>
                                            <td>
                                                <div style={
                                                        {cursor: "pointer"}
                                                    }
                                                    onClick={
                                                        this.storeMacId
                                                }>
                                                    <img src="../images/Icons/sensor_info.png" alt=""
                                                        style={
                                                            {width: '25px'}
                                                        }/>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                } </tbody>
                            </table>
                        </div>


                    </div>
                    <div>
                        <div className="container fading">
                            <p className="error-msg" id="report-error"></p>
                            <div className="container"
                                style={
                                    {paddingBottom: '20px'}
                            }>
                                <div id="sensor_details_graph"
                                    style={
                                        {display: "none"}
                                }>
                                    <div id="daily_chart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Display modal to display error messages */}
                <div id="sensor-displayModal" className="modal">
                    <div className="modal-content">
                        <p id="content"
                            style={
                                {textAlign: "center"}
                        }></p>
                        <p id="content1"
                            style={
                                {
                                    textAlign: "center",
                                    marginTop: '-13px'
                                }
                        }></p>
                        <button id="ok" className="btn-center btn success-btn"
                            onClick={
                                this.sessionTimeout
                        }>
                            OK
                        </button>
                    </div>
                </div>
            </Fragment>
        )
    }
}
