import React, { Component, Fragment } from "react";
import axios from "axios";
import "./Styling.css";
import $ from "jquery";
import {
  employeeTag,
  floorMap,
  irqSensor,
  signalRepeator,
  tempertureSensor,
} from "../../urls/apis";

class AssetReg extends Component {
  /** On page load get list of floor map for registering sensors */
  componentDidMount = () => {
    axios({
      method: "GET",
      url: floorMap,
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          this.fdata = response.data;
          if (this.fdata.length !== 0) {
            for (let i = 0; i < this.fdata.length; i++) {
              $("#fname").append(
                "<option value=" +
                  this.fdata[i].id +
                  ">" +
                  this.fdata[i].name +
                  "</option>"
              );
              $("#fname1").append(
                "<option value=" +
                  this.fdata[i].id +
                  ">" +
                  this.fdata[i].name +
                  "</option>"
              );
            }
          } else {
            $("#master-error").text(
              "Please upload floormap to register Master Gateway."
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
        } else {
          $("#master-error").text(
            "Request Failed with status code (" + error.response.status + ")."
          );
        }
      });
  };

  /** To change the state of component on entering the values in input fields */
  // handleChanges = (e) => {
  //   this.setState({ [e.target.name]: e.target.value });
  // };

  /** Displays all input fields to get details of employees for registering tracking tags */
  displayTrackingForm = () => {
    let type = $("#type").val();
    this.setState({ type: type });

    if (type === "Temperature/Humidity Sensor")
      $("#temp_form").css("display", "block");
    else $("#temp_form").css("display", "none");

    if (type === "IAQ Sensor") $("#iaq_form").css("display", "block");
    else $("#iaq_form").css("display", "none");
  };

  /** Displays Delete tag form on clicking Delete Tag Button */
  show = () => {
    $("input[type=text]").val("");
    $("input[type=email]").val("");
    document.getElementById("delete-form").style.display =
      $("#delete-form").css("display") === "none" ? "block" : "none";
    window.scrollTo(0, document.body.scrollHeight);
  };

  /** Hides all error and success messages displayed on all button clicks */
  hide = () => {
    $("#conf-error").text("");
    $("#conf-success").text("");
  };

  /** Register the both sensor and tracking tags */
  register = (e) => {
    this.hide();
    e.preventDefault();
    $("#delete-form").css("display", "none");
    let data = {};
    if ($("#tagid").val().length === 0) {
      $("#conf-error").text("Please enter tag MAC ID.");
    } else if (
      !$("#tagid").val().match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}")
    ) {
      $("#conf-error").text(
        "Invalid MAC ID entered. Please enter proper MAC ID."
      );
    } else if ($("#type").val() === "Temperature/Humidity Sensor") {
      data = {
        macaddress: $("#tagid").val(),
        x1: $("#x").val(),
        y1: $("#y").val(),
        x2: $("#x1").val(),
        y2: $("#y1").val(),
        id: $("#fname").val(),
      };
      if (
        data.x1 !== "" &&
        data.y1 !== "" &&
        data.x2 !== "" &&
        data.y2 !== "" &&
        data.id !== ""
      ) {
        axios({
          method: "POST",
          url: tempertureSensor,
          data: data,
        })
          .then((response) => {
            if (response.status === 201) {
              $("#conf-success").text(
                "Temperature-Humidity Sensor is registered successfully."
              );
            } else {
              $("#conf-error").text("Unable to register sensor.");
            }
          })
          .catch((error) => {
            if (error.response.status === 403) {
              $("#config_displayModal").css("display", "block");
              $("#content").text(
                "User Session has timed out.<br> Please Login again."
              );
            } else if (error.response.status === 400) {
              $("#conf-error").text("Tag is already registered.");
            } else {
              $("#conf-error").text(
                "Request Failed with status code (" +
                  error.response.status +
                  ")."
              );
            }
          });
      } else {
        $("#conf-error").text("Please provide all information.");
      }
    } else if ($("#type").val() === "IAQ Sensor") {
      data = {
        macaddress: $("#tagid").val(),
        x: $("#xval").val(),
        y: $("#yval").val(),
        id: $("#fname1").val(),
      };
      if (data.x !== "" && data.y !== "" && data.id !== "") {
        axios({
          method: "POST",
          url: irqSensor,
          data: data,
        })
          .then((response) => {
            if (response.status === 201) {
              $("#conf-success").text("IAQ sensor registered successfully.");
            } else {
              $("#conf-error").text("Unable to Register Tag.");
            }
          })
          .catch((error) => {
            console.log(error);
            if (error.response.status === 403) {
              $("#config_displayModal").css("display", "block");
              $("#content").text(
                "User Session has timed out.<br> Please Login again."
              );
            } else if (error.response.status === 400) {
              $("#conf-error").text("Tag is already registered.");
            } else {
              $("#conf-error").text(
                "Request Failed with status code (" +
                  error.response.status +
                  ")."
              );
            }
          });
      } else {
        $("#conf-error").text("Please provide all information.");
      }
    } else if ($("#type").val() === "Employee") {
      data = {
        macaddress: $("#tagid").val(),
      };
      axios({
        method: "POST",
        url: employeeTag,
        data: data,
      })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            $("#conf-success").text("Employee Tag registered successfully.");
          } else {
            $("#conf-error").text("Unable to Register Tag.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out.<br> Please Login again."
            );
          } else if (error.response.status === 400) {
            $("#conf-error").text("Employee Tag is already registered.");
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" +
                error.response.status +
                ") : Employee Tag"
            );
          }
        });
    } else {
      data = {
        macaddress: $("#tagid").val(),
      };
      axios({
        method: "POST",
        url: signalRepeator,
        data: data,
      })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            $("#conf-success").text(
              "Signal Repeater is registered successfully."
            );
          } else {
            $("#conf-error").text("Unable to Register Asset.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out.<br> Please Login again."
            );
          } else if (error.response.status === 400) {
            $("#conf-error").text("Signal Repeater is already registered.");
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" +
                error.response.status +
                ") : Employee Tag"
            );
          }
        });
    }
    // !data.emailid.match(
    //   "^[a-zA-Z][a-zA-Z0-9_.-]+@[a-zA-Z0-9]+[.]{1}[a-zA-Z]+$"
    // )
    $("input[type=text]").val("");
    $("input[type=email]").val("");
    $("input[type=number]").val("");
  };

  /** Unregister the registered tags */
  unregister = (e) => {
    this.hide();
    e.preventDefault();
    let id = $("#macid").val();
    if (id.length === 0)
      $("#conf-error").text("Please Enter MAC ID to Un-registered.");
    else if (!id.match("([A-Za-z0-9]{2}[-]){5}([A-Za-z0-9]){2}"))
      $("#conf-error").text("Invalid MAC ID entered.");
    else if ($("#tagtype").val() === "Temperature/Humidity Sensor") {
      axios({
        method: "DELETE",
        url: tempertureSensor,
        data: { macaddress: id },
      })
        .then((response) => {
          if (response.status === 200) {
            $("#conf-success").text("Tag un-registered successfully.");
          } else {
            $("#conf-error").text("Unable to un-registered Tag.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out.<br> Please Login again"
            );
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else if ($("#tagtype").val() === "IAQ Sensor") {
      axios({
        method: "DELETE",
        url: irqSensor,
        data: { macaddress: id },
      })
        .then((response) => {
          if (response.status === 200) {
            $("#conf-success").text("Tag un-registered successfully.");
          } else {
            $("#conf-error").text("Unable to un-registered Tag.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out.<br> Please Login again"
            );
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" + error.response.status + ")."
            );
          }
        });
    } else if ($("#tagtype").val() === "Signal Repeater") {
      console.log(id);
      axios({
        method: "DELETE",
        url: signalRepeator,
        data: { macaddress: id },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            $("#conf-success").text(
              "Signal Repeater Asset deleted successfully."
            );
          } else {
            $("#conf-error").text("Unable to delete asset.");
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out.<br> Please Login again."
            );
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" +
                error.response.status +
                ") : Employee Tag"
            );
          }
        });
    } else if ($("#tagtype").val() === "Employee") {
      axios({
        method: "DELETE",
        url: employeeTag,
        data: { macaddress: id },
      })
        .then((response) => {
          if (response.status === 200) {
            $("#conf-success").text("Employee Tag deleted successfully.");
          } else {
            $("#conf-error").text("Unable to delete Tag.");
          }
        })
        .catch((error) => {
          if (error.response.status === 403) {
            $("#config_displayModal").css("display", "block");
            $("#content").text(
              "User Session has timed out.<br> Please Login again."
            );
          } else {
            $("#conf-error").text(
              "Request Failed with status code (" +
                error.response.status +
                ") : Employee Tag"
            );
          }
        });
    }
    $("input[type=text]").val("");
    $("input[type=email]").val("");
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
        <span className="sub-heading">Asset Registration</span>
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
          {/* Element for displaying error messages */}
          <span className="error-msg" id="conf-error"></span>
          <span className="success-msg" id="conf-success"></span>
        </div>
        {/* Form for Registering the sensor and tracking tags */}
        <form id="reg-form">
          {/* Input field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Tag MAC ID :</span>
            <input
              type="text"
              id="tagid"
              required="required"
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>
          {/* Select List for Tag Type  */}
          <div className="input-group">
            <span className="label">Tag Type :</span>
            <select
              id="type"
              onChange={() => {
                this.displayTrackingForm();
                this.hide();
              }}
            >
              <option>Temperature/Humidity Sensor</option>
              <option>IAQ Sensor</option>
              <option>Signal Repeater</option>
              <option>Employee</option>
            </select>
          </div>
          <div id="temp_form" className="fading" style={{ display: "block" }}>
            {/* Input field for Floor Name */}
            <div className="input-group">
              <span className="label">Floor Name : </span>
              <select name="type" id="fname"></select>
            </div>
            <div className="input-group">
              <span className="label">X Co-ordinate : </span>
              <input type="number" id="x" required="required" />
            </div>
            <div className="input-group">
              <span className="label">Y Co-ordinate : </span>
              <input type="number" id="y" required="required" />
            </div>
            <div className="input-group">
              <span className="label">X1 Co-ordinate : </span>
              <input type="number" id="x1" required="required" />
            </div>
            <div className="input-group">
              <span className="label">Y1 Co-ordinate : </span>
              <input type="number" id="y1" required="required" />
            </div>
          </div>
          <div id="iaq_form" className="fading" style={{ display: "none" }}>
            {/* Input field for Floor Name */}
            <div className="input-group">
              <span className="label">Floor Name : </span>
              <select name="type" id="fname1"></select>
            </div>
            <div className="input-group">
              <span className="label">X Co-ordinate : </span>
              <input type="number" id="xval" required="required" />
            </div>
            <div className="input-group">
              <span className="label">Y Co-ordinate : </span>
              <input type="number" id="yval" required="required" />
            </div>
          </div>
          <div className="input-group">
            <input
              type="submit"
              value="Register Tag"
              onClick={this.register}
              className="btn success-btn"
            />
          </div>
        </form>
        {/* Button for toggeling for Deleting Tag Form */}
        <button
          onClick={() => {
            this.show();
            this.hide();
          }}
          className="btn success-btn"
        >
          Remove Tag
        </button>
        {/* Form for deleting the registered tags */}
        <form id="delete-form" className="fading" style={{ display: "none" }}>
          {/* Select List for Tag Type  */}
          <div className="input-group">
            <span className="label">Tag Type :</span>
            <select
              id="tagtype"
              onChange={() => {
                this.displayTrackingForm();
                this.hide();
              }}
            >
              <option>Temperature/Humidity Sensor</option>
              <option>IAQ Sensor</option>
              <option>Signal Repeater</option>
              <option>Employee</option>
            </select>
          </div>
          {/* Input Field for Tag MAC ID */}
          <div className="input-group">
            <span className="label">Tag MAC ID :</span>
            <input
              type="text"
              name="macid"
              id="macid"
              required="required"
              onClick={this.hide}
              placeholder="5a-c2-15-00-00-00"
            />
          </div>

          <div className="input-group">
            <input
              type="submit"
              value="Delete Tag"
              onClick={this.unregister}
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

export default AssetReg;
