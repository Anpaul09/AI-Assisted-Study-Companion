import React from "react";
import { useNavigate } from "react-router-dom";
import "./ThankYou.css"; // import the css file 

function ThankYou() {
  const navigate = useNavigate(); // navigate to different routes

  return (
    /* This is the main container for thankyou page */
    <div className="thank-you-container">
      <div className="thank-you-message">
        <h2>Thank you for signing up with us!</h2>
        <p>Your registration is successful.</p>
        {/* go to signup/login page */}
        <button onClick={() => navigate("/signup")}>
          Click here to log in
        </button>
      </div>
    </div>
  );
}

export default ThankYou;
