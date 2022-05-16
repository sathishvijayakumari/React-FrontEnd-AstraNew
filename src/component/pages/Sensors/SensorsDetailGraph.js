import React, { Component, Fragment } from "react";
import axios from "axios";
import $ from "jquery";
import "../Styling.css";
import Chart from 'chart.js/auto';
import { sensors_details_macId_details } from "../../../urls/apis";

const Underline = {
   width: "75px",
   height: "9px",
   position: "absolute",
};


export default class SensorsDetailGraph extends Component {
   constructor(props) {
      super(props);
      this.state = {
         loading: false,
         lastseen: '',
         macId: "",
         column: "",
      }
   }

   componentDidMount() {
      let macId = this.props.location.state.macId;
      let column = this.props.location.state.column;
      console.log('Sensors Macid------->', this.props.location.state);
      this.setState({ macId: macId, column: column })
      this.sensorData(macId, column);
      this.interval1 = setInterval(() => this.sensorData(macId, column), 15 * 1000);
   }

   componentWillUnmount() {
      clearInterval(this.interval1);
   }

   sensorData = (macid, column) => {
      // console.log(macid, column, 'sensorData Graph Page======>', sensors_details_macId_details);
      $("#sensor_details_graph").css("display", "none");
      this.setState({ loading: true })
      // console.log("Data MACID=--->", macid);
      axios({ method: "POST", url: sensors_details_macId_details, data: { column: column, mac: macid } })
         .then((response) => {
            const data = response.data;
            // console.log('Response ======>', response.data);
            if (data.length !== 0 && response.status === 200) {
               var lbl = [], tempData = [], ct = 1, graphName='';
               if (data.length > 100) {
                  ct = Math.ceil(data.length / 100);
               }
               if (column === "Temp") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].Temp);
                     graphName = "Temperature";
                  }
               } else if (column === "Humi") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].Humi);
                     graphName = "Humidity";
                  }
               }
               else if (column === "Co2") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].Co2);
                     graphName = "CO2";
                  }
               }
               else if (column === "VOC") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].VOC);
                     graphName = "VOC";
                  }
               }
               else if (column === "O2") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].O2);
                     graphName = "O2";
                  }
               }
               else if (column === "PM1") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].PM1);
                     graphName = "PM1";
                  }
               }
               else if (column === "PM2") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].PM2);
                     graphName = "PM2";
                  }
               }
               else if (column === "PM4") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].PM4);
                     graphName = "PM4";
                  }
               }
               else if (column === "PM10") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].PM10);
                     graphName = "PM10";
                  }
               }
               else if (column === "PtSize") {
                  for (let i = 0; i < data.length; i = i + ct) {
                     lbl.push(data[i].timestamp.substring(11, 19));
                     tempData.push(data[i].PtSize);
                     graphName = "PtSize";
                  }
               }

               $("#sensor_details_graph").css("display", "block");
               $("#chartID").text(macid);
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
                     //Bring in data
                     labels: lbl,
                     datasets: [
                        {
                           label: graphName,
                           data: tempData,
                           backgroundColor: "red",
                           borderColor: "red",
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
                        yAxes: [{ ticks: { beginAtZero: true, min: 0, stepSize: 50 } }],
                     },
                     plugins: {
                        legend: {
                           display: true,
                           position: "right",
                           fontSize: 35,
                           fontWeight: "bold",
                        },
                     },
                  },
               });
               this.setState({ loading: false });
            } else {
               $("#report-error").text(
                  "No data found on MACID : " + this.state.macId
               );
               this.setState({ loading: false });
            }
         })
         .catch((error) => {
            this.setState({ loading: false });
            console.log("Graph Error====>", error);
            if (error.response.status === 403) {
               $("#report-displayModal").css("display", "block");
               $("#content").text(
                  "User Session has timed out."
               );
               $("#content1").text(
                  "Please Login again."
               );
            } else {
               $("#report-error").text(
                  "Request Failed with status code (" + error.response.status + ")."
               );
            }
         })
   }

   /** Terminate the session on forbidden (403) error */
   sessionTimeout = () => {
      $("#report-displayModal").css("display", "none");
      sessionStorage.setItem("isLoggedIn", 0);
      this.props.handleLogin(0);
   };

   render() {
      const { macId } = this.state;
      return (
         <Fragment>
            <>
               <title>Sensor Details</title>
            </>
            <div className="panel">
               <span className="main-heading">Sensor Details</span><br />
               <img alt="" src="../images/Tiles/Underline.png" style={Underline} />

               <p style={{ fontSize: '23px', marginTop: '40px' }}>
                   Sensor MACID :  {macId}
               </p>
               <div className="container fading">
                  <p className="error-msg" id="report-error"></p>
                  <div className="container" style={{ paddingBottom: '20px' }}>
                     <div id="sensor_details_graph" style={{ display: "none" }}>
                        <div id="daily_chart"></div>
                     </div>
                  </div>
               </div>
            </div>

            {
               this.state.loading && (
                  <div className="spinner">
                     <div style={{ display: 'flex', marginLeft: '50px'}}>
                        <div className="loader">
                        </div>
                        <p style={{
                           fontSize: '20px', fontWeight: 'bold', marginTop: '7px',
                           paddingLeft: '10px', color: 'red'
                        }}>Please Wait...</p>
                     </div>
                  </div>
               )
            }

            {/* Display modal to display error messages */}
            <div id="report-displayModal" className="modal">
               <div className="modal-content">
                  <p id="content" style={{ textAlign: "center" }}></p>
                  <p id="content1" style={{ textAlign: "center", marginTop: '-13px' }}></p>
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
      )
   }
}
