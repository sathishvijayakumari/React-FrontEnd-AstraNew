import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import $ from "jquery";
import "../Styling.css";
import { sensors_details_macIds } from "../../../urls/apis";
import { Link } from "react-router-dom";

const Underline = {
   width: "75px",
   height: "9px",
   position: "absolute",
};

export default class SensorDetails extends Component {
   constructor(props) {
      super(props);
      this.state = {
         lastseen: '',
         macId: "",
         sensorDet: [],
      }
   }

   componentDidMount() {
      localStorage.removeItem("sensor_macid");
      // API call to get the all sensors details
      this.sensorsDetails();
      // this.interval1 = setInterval(this.sensorsDetails, 15 * 1000);
   }

   // componentWillUnmount() {
   //    clearInterval(this.interval1);
   // }

   sensorsDetails = () => {
      $("#sensor_error").text("");
      this.setState({ sensorDet: [] });
      console.log('sensorsDetails Page======>', sensors_details_macIds);
      axios({ method: "GET", url: sensors_details_macIds})
         .then((response) => {
            if (response.status === 200 || response.status === 201) {
               var dt = response.data;
               console.log('======>', response);
               if (dt.length !== 0) {
                  let datas = [];
                  for (let i = 0; i < dt.length; i++) {
                     let timestamp = dt[i].timestamp.substring(0, 19).replace("T", " ");
                     let status = "red";
                     if (new Date() - new Date(timestamp) <= 2 * 60 * 1000) {
                        status = "green";
                     }

                     datas.push({
                        sno: (i + 1).toString(),
                        macid: dt[i].MACID,
                        lastseen: timestamp,
                        status: status,
                     })
                  }
                  this.setState({ sensorDet: datas });
               }else {
                  $("#sensor_error").text("No Sensor Data found.");
               }
            }
         })
         .catch((error) => {
            console.log('error=====>', error);
            if (error.response.status === 403) {
               $("#sensor-displayModal").css("display", "block");
               $("#content").text(
                  "User Session has timed out."
               );
               $("#content1").text(
                  "Please Login again."
               );
            } else {
               $("#sensor_error").text(
                  "Request Failed with status code (" + error.response.status + ")."
               );
            }
         });
   }

   /** Terminate the session on forbidden (403) error */
   sessionTimeout = () => {
      $("#sensor-displayModal").css("display", "none");
      sessionStorage.setItem("isLoggedIn", 0);
      this.props.handleLogin(0);
   };

   storeMacId = (macId) => {
      console.log('###################', macId);
      localStorage.setItem("sensor_macid", JSON.stringify({ macId: macId }));
   }


   /** Redern the html content on the browser */
   render() {
      const { sensorDet } = this.state;
      return (
         <Fragment>
            <Helmet>
               <title>Sensor Details</title>
            </Helmet>
            <div className="panel">
               <span className="main-heading">Sensor Details</span><br />
               <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
               <div className="container fading">
                  <p className="error-msg" id="sensor_error"></p>
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
                              <th>Last Seen</th>
                              <th>Status</th>
                              <th>Details
                              </th>
                           </tr>
                        </thead>
                        <tbody id="sensorTable">
                           {
                              sensorDet.map((item, index) => (
                                 <tr key={index}>
                                    <td>{item.sno}</td>
                                    <td>{item.macid}</td>
                                    <td>{item.lastseen}</td>
                                    <td>{item.status === "red" ? (
                                       <div className='circle'
                                          style={{ margin: 'auto', backgroundColor: "red", }}>
                                       </div>) : (
                                       <div className='circle'
                                          style={{ margin: 'auto', backgroundColor: "green", }}>
                                       </div>
                                    )}
                                    </td>
                                    <td>
                                       <Link to="/sensordetailscards"
                                          onClick={() => this.storeMacId(item.macid)}>

                                          <img src="../images/Icons/sensor_info.png"
                                             alt=""
                                             style={{ width: '25px' }} />
                                       </Link>
                                    </td>
                                 </tr>
                              ))
                           }
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
            {/* Display modal to display error messages */}
            <div id="sensor-displayModal" className="modal">
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
