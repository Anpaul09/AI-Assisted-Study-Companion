// src/mainpages/Logout.js
import React from "react";
import "./Logout.css"; // import the css file
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // this is to handle the cookies
import { FiLogOut, FiX } from "react-icons/fi"; // the logout and cancel icons

function Logout() {
  const navigate = useNavigate(); // navigate to different routes

  const handleLogout = () => {
    Cookies.remove("rememberedPassword"); // this will remove the stored password cookie
    navigate("/Home"); // this will take the user to the home page after logout
  };

  return (
    /* This is the main container for the logout page */
    <div className="logOutMain">
      {/* This is the message on the logout page */}
      <div className="logOut-message">
        <h2>Are you sure you want to logout?</h2>
        <p>You will need to log in again to access your account.</p>

        <div className="logOut-Buttons">
          {/* This is confirm logout button */}
          <button id="logout" className="confirm-Button" onClick={handleLogout}>
            {/* if the user clicks on the confirm it takes the user to the
            home page */}
            <FiLogOut className="button-icon" />
            <span>Confirm Logout</span>
          </button>
          {/* This is the cancel that takes the user back to the dashboard */}
          <button
            className="cancel-Button"
            onClick={() => navigate("/Dashboard")} // if the user clicks on the cancel it takes the user back to the dashboard page
          >
            <FiX className="button-icon" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;
