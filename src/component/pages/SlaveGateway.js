import React, { Component, Fragment } from "react";
import axios from "axios";
import "./Styling.css";
import $ from "jquery";
import { masterGateway, slaveGateway } from "../../urls/apis";

class SlaveGateway extends Component {
  /** On page load get list of master gateways already registered for floor */
  componentDidMount() {
    axios({
      method: "GET",
      url: masterGateway,
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          this.fdata = response.data;
          if (this.fdata.length !== 0) {
            for (let i = 0; i < this.fdata.length; i++) {
              $("#mastergatewayid").append(
                "<option>" + this.fdata[i].gatewayid + "</option>"
              );
            }
          } else {
            $("#slave-error").text(
              "Please register Master Gateway to register Slave Gateway."
            );
          }
        } else {
          $("#slave-error").text("Unable to get Gateway ID's");
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          $("#config_displayModal").css("display", "block");
          $("#content").text("User Session has timed out. Please Login again");
        } else if (error.response.status === 404) {
          $("#slave-error").text("No master gateway is registered.");
        } else {
          $("#slave-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  }

  /** Displays Delete slave gateway form on clicking Delete Gateway Button */
  show = () => {
    $("#slaveid").val("");
    $("input[type='text']").val("");
    document.getElementById("slave-del-form").style.display =
      $("#slave-del-form").css("display") === "block" ? "none" : "block";
  };

  /** Hides all error and success messages displayed on all button clicks */
  hide = () => {
    $("#slave-error").text("");
    $("#slave-success").text("");
  };

  /** Method to register slave gateway under specific master gateway */
  registerSlave = (e) => {
    this.hide();
    $("#slave-del-form").css("display", "none");
    e.preventDefault();
    // let master = $("#mastergatewayid").val();
    let slave = $("#slaveid").val();
    if (slave.length === 0) {
      $("#slave-error").text("Please enter Slave-Gateway ID.");
    } else if (!slave.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#slave-error").text("Invalid Slave-Gateway ID entered.");
    } else {
      let gateway = $("#mastergatewayid").val();

      axios({
        method: "POST",
        url: slaveGateway,
        data: { master: gateway, macaddress: slave },
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            $("#slave-success").text("Slave Gateway registered successfully.");
            $("#slaveid").val("");
          } else {
            $("#slave-error").text("Unable to registered Slave Gateway.");
          }
        })
        .catch((error) => {
          // console.log(error);
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again"
            );
          } else {
            $("#slave-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    }
  };

  /** Method to delete already registered slave gateways */
  unregisterSlave = (e) => {
    this.hide();
    e.preventDefault();
    let id = $("#slaveid-del").val();
    if (id.length === 0) {
      $("#slave-error").text("Please enter Slave-Gateway ID for deletion.");
    } else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")) {
      $("#slave-error").text("Invalid Slave-Gateway ID entered.");
    } else {
      axios({
        method: "DELETE",
        url: slaveGateway,
        data: { macaddress: id },
      })
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            $("#slave-success").text(
              "Slave Gateway un-registered successfully."
            );
            $("#slaveid-del").val("");
            this.show();
          } else {
            $("#slave-error").text("Unable to un-registered Slave Gateway.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out. Please Login again"
            );
          } else {
            $("#slave-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    }
  };

  /** Terminate the session on forbidden (403) error */
  sessionTimeout = () => {
    $("#config_displayModal").css("display", "none");
    sessionStorage.setItem("isLoggedIn", 0);
    this.props.handleLoginError();
  };

  render() {
    return (
      <Fragment>
        <span className="sub-heading">Slave Gateway Registration</span>
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
        <div>
          {/* Elements for displaying error messages */}
          <span className="error-msg" id="slave-error"></span>
          <span className="success-msg" id="slave-success"></span>
        </div>
        {/* Form to register slave gateway */}
        <form id="slave-reg-form">
          {/* Input field for Gateway ID */}
          <div className="input-group">
            <span className="label">Master Gateway ID :</span>
            <select id="mastergatewayid"></select>
          </div>
          {/* Select list for Floor names */}
          <div className="input-group">
            <span className="label">Gateway ID :</span>
            <input
              type="text"
              name="slaveid"
              id="slaveid"
              required="required"
              placeholder="5a-c2-15-00-00-00"
              onChange={this.hide}
            />
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Register Gateway"
              onClick={this.registerSlave}
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
          id="slave-del-form"
          className="fading"
          style={{ display: "none" }}
        >
          {/* Input Field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Gateway MAC ID :</span>
            <input
              type="text"
              name="slaveid-del"
              id="slaveid-del"
              required="required"
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Delete Gateway"
              onClick={this.unregisterSlave}
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

export default SlaveGateway;
