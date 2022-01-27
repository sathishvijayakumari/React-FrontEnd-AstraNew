import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import $ from "jquery";
import "./Styling.css";
import { sensors_details } from "../../urls/apis";

class SensorDetails extends Component {
   /** Method is called on Component Load */
   constructor(props) {
      super(props);
      this.state = {
         lastseen: ''
      }
   }

   componentDidMount() {
      // API call to get the all asset details
      this.sensorsDetails();
      this.interval1 = setInterval(this.sensorsDetails, 15 * 1000);
   }

   componentWillUnmount() {
      clearInterval(this.interval1);
   }

   sensorsDetails = () => {
      axios({ method: "GET", url: sensors_details })
         .then((response) => {
            if (response.status === 200 || response.status === 201) {
               var dt = response.data;
               console.log('======>', response);
               if (response.data.length !== 0) {
                  $("#reportsTable").empty();
                  console.log(dt.length, 'Data======>', dt.MACID);
                  for (let i = 0; i < dt.length; i++) {
                     this.setState({ lastseen: dt[i].timestamp.substring(0, 19).replace("T", " ") })
                     $("#reportsTable").append(
                        "<tr>" +
                        "<td>" + (i + 1) + "</td>" +
                        "<td>" + dt[i].MACID + "</td>" +
                        "<td>" + parseFloat(dt[i].Temp).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].Humi).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].Co2).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].PM1).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].PM2).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].PM4).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].PM10).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].NC0).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].NC1).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].NC2).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].NC4).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].NC10).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].PtSize).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].O2).toFixed(2) + "</td>" +
                        "<td>" + parseFloat(dt[i].VOC).toFixed(2) + "</td>" +
                        // "<td>" + dt[i].timestamp + "</td>"
                        + "</tr>"
                     );
                  }
               }
            }
         })
         .catch((error) => {
            console.log('error=====>', error);
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
         });
   }

   /** Terminate the session on forbidden (403) error */
   sessionTimeout = () => {
      $("#report-displayModal").css("display", "none");
      sessionStorage.setItem("isLoggedIn", 0);
      this.props.handleLogin(0);
   };

   /** Redern the html content on the browser */
   render() {
      const { lastseen } = this.state;
      return (
         <Fragment>
            <Helmet>
               <title>Sensor Details</title>
            </Helmet>
            <div className="panel">
               <span className="main-heading">Sensor Details</span>
               <p style={{ fontSize: '20px' }}>Last Updated :  {lastseen}</p>
               <div className="container fading" style={{ marginTop: "10px" }}>
                  <p className="error-msg" id="report-error"></p>
                  {/* SIGNAL REPEATER TAGS TABLE */}
                  <div className="container">

                     {/* Table displays Sensor tags registered */}
                     <table
                        style={{
                           marginTop: "20px",
                           marginBottom: "30px",
                        }}
                     >
                        <thead>
                           <tr>
                              <th>Sl.No</th>
                              <th>MAC ID</th>
                              <th>TEMPERATURE</th>
                              <th>HUMIDITY</th>
                              <th>CO2</th>
                              <th>PM1.0</th>
                              <th>PM2.5</th>
                              <th>PM4.0</th>
                              <th>PM10.0</th>
                              <th>NC0.5</th>
                              <th>NC1.0</th>
                              <th>NC2.5</th>
                              <th>NC4.0</th>
                              <th>NC10.0</th>
                              <th>PtSize</th>
                              <th>O2</th>
                              <th>VOC</th>
                              {/* <th>LAST SEEN</th> */}
                           </tr>
                        </thead>
                        <tbody id="reportsTable"></tbody>
                     </table>
                  </div>
               </div>
            </div>
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
      );
   }
}

export default SensorDetails;
