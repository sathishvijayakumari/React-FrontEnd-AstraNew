import React, { Component, Fragment } from "react";
import axios from "axios";
import "./Styling.css";
import $ from "jquery";
import { masterGateway, floorMap } from "../../urls/apis";

class MasterGateway extends Component {
  /** On page load it gets list of floor map registed */
  componentDidMount() {
    // API call to get the all floor names registered for registering gateways
    axios({
      method: "GET",
      url: floorMap,
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          this.fdata = response.data;
          console.log("Floor Data========>", this.fdata);
          if (this.fdata.length !== 0) {
            for (let i = 0; i < this.fdata.length; i++) {
              $("#fname").append("<option>" + this.fdata[i].name + "</option>");
            }
          } else {
            $("#master-error").text(
              "Please upload Floor Map to register Master Gateway."
            );
          }
        } else {
          $("#master-error").text("Unable to fetch floor names");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#config_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again.");
        } else if (error.response.status === 404) {
          $("#master-error").text("No floor map is registered.");
        } else {
          $("#master-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  /** Displays Delete master gateway form on clicking Delete Gateway Button */
  show = () => {
    document.getElementById("gatewayid").value = "";
    $("input[type='text']").val("");
    document.getElementById("gateway-del-form").style.display =
      document.getElementById("gateway-del-form").style.display === "block"
        ? "none"
        : "block";
  };

  /** Hides all error and success messages displayed on all button clicks */
  hide = () => {
    document.getElementById("master-error").innerHTML = "";
    document.getElementById("master-success").innerHTML = "";
  };

  /** Reigster the master gateway for particular floor */
  registerGateway = (e) => {
    this.hide();
    e.preventDefault();
    let id = document.getElementById("gatewayid").value;
    if (id.length === 0) {
      document.getElementById("master-error").innerHTML =
        "Please enter Gateway ID.";
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      document.getElementById("master-error").innerHTML =
        "Invalid Gateway ID entered.";
    } else {
      document.getElementById("master-error").innerHTML = "";
      let name = document.getElementById("fname").value;
      let floorid;
      for (let i = 0; i < this.fdata.length; i++) {
        if (this.fdata[i].name === name) {
          floorid = this.fdata[i].id;
          break;
        }
      }
      axios({
        method: "POST",
        url: masterGateway,
        data: { macaddress: id, id: floorid },
      })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            document.getElementById("master-success").innerHTML =
              "Gateway registered successfully.";
              $("#gatewayid").val("");
          } else {
            document.getElementById("master-error").innerHTML =
              "Unable to Register Gateway.";
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.status === 403) {
            document.getElementById("config_displayModal").style.display =
              "block";
            document.getElementById("content").innerHTML =
              "User Session has timed out. Please Login again";
          } else {
            document.getElementById("master-error").innerHTML =
              "Request Failed with status code (" +
              error.response.status +
              ").";
          }
        });
    }
  };

  /** Remove master gateway for particular floor along with all slaves under it */
  unregisterGateway = (e) => {
    this.hide();
    e.preventDefault();
    let id = document.getElementById("gateway").value;
    if (id.length === 0) {
      document.getElementById("master-error").innerHTML =
        "Please enter Gateway ID.";
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      document.getElementById("master-error").innerHTML =
        "Invalid Gateway ID entered.";
    } else {
      axios({
        method: "DELETE",
        url: masterGateway,
        data: { macaddress: id },
      })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            document.getElementById("master-success").innerHTML =
              "Gateway un-registered successfully.";
              $("#gateway").val("");
              this.show();
          } else {
            document.getElementById("master-error").innerHTML =
              "Unable to un-register Gateway.";
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            document.getElementById("config_displayModal").style.display =
              "block";
            document.getElementById("content").innerHTML =
              "User Session has timed out. Please Login again";
          } else {
            document.getElementById("master-error").innerHTML =
              "Request Failed with status code (" +
              error.response.status +
              ").";
          }
        });
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    document.getElementById("config_displayModal").style.display = "none";
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLoginError();
  };

  render() {
    return (
      <Fragment>
        <span className="sub-heading">Master Gateway Registration</span>
        <br />
        <img
          src="../images/Tiles/Underline.png"
          alt=""
          style={{
            width: "56px",
            height: "3px",
            marginTop: "2px",
            position: "absolute",
          }}
        />
        <br></br>
        {/* Elements for displaying error messages */}
        <div>
          <span className="error-msg" id="master-error"></span>
          <span className="success-msg" id="master-success"></span>
        </div>
        {/* Form to register master gateway */}
        <form id="gateway-reg-form">
          {/* Select list for Floor names */}
          <div className="input-group">
            <span className="label">Floor Name :</span>
            <select name="type" id="fname"></select>
          </div>
          {/* Input field for Gateway ID */}
          <div className="input-group">
            <span className="label">Gateway ID :</span>
            <input
              type="text"
              name="gatewayid"
              id="gatewayid"
              required="required"
              placeholder="5a-c2-15-00-00-00"
              onChange={this.hide}
            />
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Register Gateway"
              onClick={this.registerGateway}
              className="btn success-btn"
            />
          </div>
        </form>
        {/* Button for toggeling for Deleting Gateway Form */}
        <button
          onClick={() => {
            this.show();
            this.hide();
          }}
          className="btn success-btn"
        >
          Remove Gateway
        </button>
        {/* Form for deleting the registered gateway tags */}
        <form
          id="gateway-del-form"
          className="fading"
          style={{ display: "none" }}
        >
          {/* Input Field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Gateway MAC ID :</span>
            <input
              type="text"
              name="gateway"
              id="gateway"
              required="required"
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>
          {/* Elements for displaying error messages */}
          <div className="input-group">
            <input
              type="submit"
              value="Delete Gateway"
              onClick={this.unregisterGateway}
              className="btn success-btn"
            />
          </div>
        </form>
        {/* Display modal to display error messages */}
        <div id="config_displayModal" className="modal">
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
      </Fragment>
    );
  }
}

export default MasterGateway;
