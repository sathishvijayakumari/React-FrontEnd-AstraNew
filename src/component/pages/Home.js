import React, { Component, Fragment } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { linkClicked } from "../navbar/Navbar";
import "./Styling.css";

// Styling property for Widget Image size
const ImageSize = {
  width: "85%",
  height: "85%",
  margin: "0px",
  padding: "0px",
};

// Styling property for Underline Image
const Underline = {
  width: "75px",
  height: "9px",
  position: "absolute",
};

class Home extends Component {
  /** Method is called on Component Load */
  componentDidMount() {
    linkClicked(0);
    // sets a timer for auto logout on session expiry
    // setTimeout(() => {
    //   sessionStorage.setItem("isLoggedIn", 0);
    //   this.props.handleLogin(0);
    // }, 595 * 1000);
  }

  /** Redern the html content on the browser */
  render() {
    return (
      <Fragment>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <div className="panel">
          <span className="main-heading">HOME</span>
          <br />
          <img alt="" src="../images/Tiles/Underline.png" style={Underline} />
          <div className="container fading" style={{ marginTop: "50px" }}>
            <div className="row">
              <span className="heading">Configuration</span>
              <br />
              <hr></hr>
              {/* Widget for Configuration, on click navigate to Configuration page */}
              <div className="col-4">
                <Link to="/configuration">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Config.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(1)}
                  />
                </Link>
              </div>
              {/* Widget for Upload Floor Map, on click navigate to Upload Map page */}
              <div className="col-4">
                <Link to="/uploadmap">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Upload.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(2)}
                  />
                </Link>
              </div>
              {/* Widget for All Assets, on click navigate to Assets page */}
              <div className="col-4">
                <Link to="/assets">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Assets.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(4)}
                  />
                </Link>
              </div>
              {/* Widget for All Assets, on click navigate to ZOne Configuration page */}
              <div className="col-4">
                <Link to="/zoneconfig">
                  <img
                    alt=""
                    src="../images/Widgets/ZoneConfig.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(4)}
                  />
                </Link>
              </div>
            </div>
            <br></br>

            <div className="row">
              <span className="heading">Personnel Management</span>
              <br />
              <hr></hr>
              {/* Widget for Employee registration */}
              <div className="col-4">
                <Link to="/employeeRegistration">
                  <img
                    alt=""
                    src="../images/Widgets/EmployeeRegistration.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(8)}
                  />
                </Link>
              </div>
              {/* Widget for Tag allocation */}
              <div className="col-4">
                <Link to="/tagAllocation">
                  <img
                    alt=""
                    src="../images/Widgets/TagAllocation.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(8)}
                  />
                </Link>
              </div>
              {/* Widget for Tracking, on click navigate to Tracking page */}
              <div className="col-4">
                <Link to="/tracking">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Realtime.png"
                    style={ImageSize}
                    className="fading"
                    onClick={() => linkClicked(1)}
                  />
                </Link>
              </div>
              {/* Widget for Distance Tracking */}
              <div className="col-4">
                <Link to="/distanceTracking">
                  <img
                    alt=""
                    src="../images/Widgets/ContactTracing.png"
                    style={ImageSize}
                    className="fading"
                    onClick={() => linkClicked(2)}
                  />
                </Link>
              </div>
              {/* Widget for Alerts, on click navigate to Daily Reports page */}
              <div className="col-4">
                <Link to="/dailyreport">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Reports.png"
                    style={ImageSize}
                    className="fading"
                    onClick={() => linkClicked(3)}
                  />
                </Link>
              </div>
            </div>

            <br></br>
            <div className="row">
              <span className="heading">Environment Management</span>
              <br />
              <hr></hr>
              {/* Widget for Alerts, on click navigate to Thermal map page */}
              <div className="col-4">
                <Link to="/thermalmap">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_ThermalMap.png"
                    style={ImageSize}
                    className="fading"
                    onClick={() => linkClicked(4)}
                  />
                </Link>
              </div>
              <div className="col-4">
                <Link to="/airquality">
                  <img
                    alt=""
                    src="../images/Widgets/AirQualityParamters.png"
                    style={ImageSize}
                    className="fading"
                    onClick={() => linkClicked(5)}
                  />
                </Link>
              </div>
            </div>

            <br></br>
            <div className="row">
              <span className="heading">System</span>
              <br />
              <hr></hr>
              {/* Widget for System Health, on click navigate to System Health page */}
              <div className="col-4">
                <Link to="/systemhealth">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Syshealth.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(5)}
                  />
                </Link>
              </div>
              {/* Widget for Alerts, on click navigate to Alerts page */}
              <div className="col-4">
                <Link to="/alerts">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Alert.png"
                    style={ImageSize}
                    className="fading"
                    onClick={() => linkClicked(6)}
                  />
                </Link>
              </div>

              <div className="col-4">
                <Link to="/sensordetails">
                  <img
                    alt=""
                    src="../images/Widgets/Widget_Sensors.png"
                    style={ImageSize}
                    className="fading"
                  // onClick={() => linkClicked(7)}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Home;
