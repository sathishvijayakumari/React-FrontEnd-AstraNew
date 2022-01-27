import React, { Component, Fragment } from "react";
import "./Header.css";
import axios from "axios";
import { logoutAPI } from "../../urls/apis";

const Logo = {
  opacity: "0.6",
  width: "35px",
  float: "right",
  marginRight: "30px",
  cursor: "pointer",
};

// const Logout = {
//   opacity: "0.8",
//   float: "right",
//   color: "grey",
//   marginRight: "-40px",
//   marginTop: "20px",
//   fontFamily: "Roboto-Medium",
// };

class Header extends Component {
  logout = () => {
    axios({
      method: "GET",
      url: logoutAPI,
    })
      .then((response) => {
        sessionStorage.clear("isLoggedIn");
        // sessionStorage.setItem("isLoggedIn", 0);
        this.props.handleLogin(0);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          sessionStorage.setItem("isLoggedIn", 0);
          this.props.handleLogin(0);
        }
      });
  };

  render() {
    return (
      <Fragment>
        <div className="navbar">
          <div>
            <img alt="" src="../images/Tiles/Logo.png" />
            <img
              alt=""
              src="../images/Icons/Icon_Logout.png"
              style={Logo}
              title="Logout"
              onClick={this.logout}
              className="logoutImg"
            />
            {/* <a href=""> */}
            {/* <p style={Logout}></p> */}
            {/* </a> */}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Header;
