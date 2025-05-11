import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaEnvelope } from "react-icons/fa";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth"; // this is firebase password reset function
import "./ForgotPassword.css"; // import the css file 

function ForgotPassword() {
  const navigate = useNavigate(); // navigate to different routes
  const [email, setEmail] = useState(""); // the user's input on the page
  const [validMessage, setValidMessage] = useState(""); // this is for the success message
  const [errorMessage, setErrorMessage] = useState(""); // this is for the error message
  const [loading, setLoading] = useState(false); // this is for the loading state

  // This is to ensure that email address the user entered is valid
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const commonMistakes = [
      "gmai.com",
      "yaho.com",
      "outlok.com",
      "hotmial.com",
    ];
    const emailDomain = email.split("@")[1];

    return emailRegex.test(email) && !commonMistakes.includes(emailDomain);
  };

  // the password reset link is sent
  const handleResetPassword = async () => {
    setValidMessage("");
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address."); // if input is empty this error will show
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address."); // if the email address entered is invalid this error will show 
      return;
    }

    setLoading(true); // show loading
    const emailLowerCase = email.toLowerCase(); // this is to match the email stored in Firebase

    try {
      // the password reset email is sent
      await sendPasswordResetEmail(auth, emailLowerCase);
      setValidMessage(
        "A password reset link has been sent if an account exists with this email."
      ); // this is the message that will show after the user enters a valid email address that matches the email in the firebase
      setLoading(false);
    } catch (error) {
      // console.error("Password Reset Error:", error);
      setErrorMessage("An error occurred. Please try again."); // an error message is showed
      setLoading(false);
    }
  };

  return (
    /* This is the main container for forgot password page */
    <div className="login-container">
      <div className="login-form-container">
        {/* This is the forgot password page title */}
        <div className="login-title">
          <h1>FORGOT PASSWORD</h1>
        </div>
        {/* A description is also showed for the user to enter an email address */}
        <div className="forgot-password-description">
          <p>Enter your email to receive a password reset link.</p>
        </div>
        <div className="login-form">
          <div className="fpform-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // the email state is updated
              placeholder="Email Address"
              disabled={loading}
            />
          </div>

          {/* show either an error message or a success message */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {validMessage && <p className="success-message">{validMessage}</p>}

          <button
            className="login-button"
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {/* this will take the user back to the login page */}
          <div className="back-to-login">
            <span onClick={() => navigate("/signup")}>Back to Login</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
