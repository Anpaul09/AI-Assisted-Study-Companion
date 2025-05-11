import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { auth, database } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ref, set } from "firebase/database";

function Signup() {
  const moves = useNavigate();

  // Add a function to validate email domain
  const isValidEmailDomain = (email) => {
    const validDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "icloud.com",
      "mail.com",
      "protonmail.com",
    ];

    const domain = email.split("@")[1]?.toLowerCase();
    return validDomains.includes(domain);
  };

  const [rememberMe, setRememberMe] = useState(
    Cookies.get("rememberMe") === "true"
  );

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    Cookies.set("rememberMe", isChecked, { expires: 365 }); // the email details will be saved for a year
  };

  const [userInfo, settingUserInfo] = useState({
    name: "",
    email:
      Cookies.get("rememberMe") === "true"
        ? Cookies.get("rememberedEmail") || ""
        : "",
    password: "",
  });

  const [authenticationMode, settingAuthenticationMode] = useState("Log in");
  const [checkButton, settingCheckButton] = useState(true);
  const [showPassword, settingToshowpassword] = useState(false);
  const [signupPasswordRequirements, setSignupPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialcharacters: false,
  });

  const [emailMessageError, setEmailMessageError] = useState("");
  const [loginError, setLoginError] = useState({
    email: "",
    password: "",
  });

  // Function to handle user input
  const userInputDetails = (userInput) => {
    const { name, value } = userInput.target;
    settingUserInfo({ ...userInfo, [name]: value });

    if (name === "password") {
      passwordValidation(value);
    }
  };

  // Function to validate password
  const passwordValidation = (password) => {
    setSignupPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialcharacters: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  // Function to toggle password visibility
  const passwordIsvisible = () => {
    settingToshowpassword((prevState) => !prevState);
  };

  // Function to handle action change (Sign up/Log in)
  const handleActionChange = (newAction) => {
    setSignupPasswordRequirements({
      length: false,
      uppercase: false,
      number: false,
      specialcharacters: false,
    });

    settingAuthenticationMode(newAction);
    settingUserInfo({ name: "", email: "", password: "" });
    setEmailMessageError("");
    setLoginError({ email: "", password: "" }); // Reset login errors when switching modes
  };

  // Function to reset email error message
  const resetEmailMessageError = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (userInfo.email.trim() && emailRegex.test(userInfo.email)) {
      setEmailMessageError("");
    }
  };

  // Modify the entryChecked function to include domain validation
  const entryChecked = async () => {
    const { email, password, name } = userInfo;

    // Reset error messages at the start
    setLoginError({ email: "", password: "" });

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setLoginError({
        email: "Please enter a valid email address format",
        password: "",
      });
      return;
    }

    try {
      if (authenticationMode === "Sign up") {
        // Check for valid email domain before proceeding with signup
        if (!isValidEmailDomain(email)) {
          setLoginError({
            email:
              "Please use a valid email domain (e.g., gmail.com, yahoo.com, outlook.com)",
            password: "",
          });
          return;
        }

        const isPasswordValid =
          signupPasswordRequirements.length &&
          signupPasswordRequirements.uppercase &&
          signupPasswordRequirements.number &&
          signupPasswordRequirements.specialcharacters;

        if (!isPasswordValid) {
          alert("Password does not meet the requirements.");
          return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;

          await updateProfile(user, { displayName: name });
          await set(ref(database, `users/${user.uid}`), {
            name: name,
            email: email,
          });

          console.log("User registered and data saved to the database.");
          moves("/ThankYou");
        } catch (error) {
          console.error("Signup error:", error.code);
          switch (error.code) {
            case "auth/email-already-in-use":
              setLoginError({
                email:
                  "An account already exists with this email address. Please log in instead.",
                password: "",
              });
              break;
            case "auth/invalid-email":
              setLoginError({
                email: "Please enter a valid email address",
                password: "",
              });
              break;
            case "auth/weak-password":
              setLoginError({
                email: "",
                password: "Please choose a stronger password",
              });
              break;
            default:
              setLoginError({
                email: "Sign up failed",
                password: "Please try again",
              });
          }
        }
      } else if (authenticationMode === "Log in") {
        // For login, we should still check basic email format but don't need to validate domain
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          const user = userCredential.user;
          console.log("User logged in:", user.displayName);
          moves("/Dashboard");

          if (rememberMe) {
            Cookies.set("rememberedEmail", email, { expires: 365 }); // the email details will be saved for a year
          } else {
            Cookies.remove("rememberedEmail");
          }
        } catch (error) {
          console.error("Login error:", error.code);
          switch (error.code) {
            case "auth/user-not-found":
              setLoginError({
                ...loginError,
                email: "No account found with this email address",
              });
              break;
            case "auth/wrong-password":
              setLoginError({ ...loginError, password: "Incorrect password" });
              break;
            case "auth/invalid-email":
              setLoginError({ ...loginError, email: "Invalid email format" });
              break;
            case "auth/too-many-requests":
              setLoginError({
                email: "Too many failed attempts",
                password: "Please try again later or reset your password",
              });
              break;
            default:
              setLoginError({
                email: "Login failed",
                password: "Please check your credentials and try again",
              });
          }
        }
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  // Also update the apprUserInput function to include domain validation
  const apprUserInput = () => {
    const { email, password } = userInfo;
    const emailProperty = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isEmailAddressValid =
      emailProperty.test(email) &&
      (authenticationMode === "Log in" || isValidEmailDomain(email));
    const isPasswordValid = password.length >= 8;

    settingCheckButton(!(isEmailAddressValid && isPasswordValid));
  };

  // Effect to validate user input
  useEffect(() => {
    apprUserInput();
  }, [userInfo]);

  // Effect to handle button state
  useEffect(() => {
    if (authenticationMode === "Sign up") {
      const isFormValid =
        userInfo.name.trim() &&
        userInfo.email.trim() &&
        userInfo.password.trim() &&
        signupPasswordRequirements.length &&
        signupPasswordRequirements.uppercase &&
        signupPasswordRequirements.number &&
        signupPasswordRequirements.specialcharacters;

      settingCheckButton(!isFormValid);
    } else {
      const isFormValid = userInfo.email.trim() && userInfo.password.trim();
      settingCheckButton(!isFormValid);
    }
  }, [userInfo, signupPasswordRequirements, authenticationMode]);

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-title">
          <h1>USER LOGIN</h1>
        </div>

        <div className="login-tabs">
          <div
            className={`login-tab ${
              authenticationMode === "Sign up" ? "active" : ""
            }`}
            onClick={() => handleActionChange("Sign up")}
          >
            Sign Up
          </div>
          <div
            className={`login-tab ${
              authenticationMode === "Log in" ? "active" : ""
            }`}
            onClick={() => handleActionChange("Log in")}
          >
            Log In
          </div>
        </div>

        <div className="login-form">
          {authenticationMode === "Sign up" && (
            <div className="signupform-group">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={userInputDetails}
                placeholder="Username"
              />
            </div>
          )}

          <div className="signupform-group">
            <div className="input-icon">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              value={userInfo.email}
              onChange={userInputDetails}
              onBlur={resetEmailMessageError}
              placeholder="Email Address"
            />
            {loginError.email && (
              <p className="error-message">{loginError.email}</p>
            )}
          </div>

          <div className="signupform-group">
            <div className="input-icon">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={userInfo.password}
              onChange={userInputDetails}
              placeholder="Password"
            />
            <div className="password-toggle" onClick={passwordIsvisible}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {loginError.password && (
              <p className="error-message">{loginError.password}</p>
            )}
          </div>

          {authenticationMode === "Sign up" && (
            <div className="password-requirements">
              <ul>
                <li
                  className={
                    signupPasswordRequirements.length ? "valid" : "invalid"
                  }
                >
                  At least 8 characters
                </li>
                <li
                  className={
                    signupPasswordRequirements.uppercase ? "valid" : "invalid"
                  }
                >
                  One uppercase letter
                </li>
                <li
                  className={
                    signupPasswordRequirements.number ? "valid" : "invalid"
                  }
                >
                  One number
                </li>
                <li
                  className={
                    signupPasswordRequirements.specialcharacters
                      ? "valid"
                      : "invalid"
                  }
                >
                  One special character
                </li>
              </ul>
            </div>
          )}

          {authenticationMode === "Log in" && (
            <div className="login-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
                <label htmlFor="remember">Remember Me</label>
              </div>
              <div className="forgot-password">
                <Link to="/ForgotPassword">Forgot Password?</Link>
              </div>
            </div>
          )}

          <button
            className="login-button"
            onClick={entryChecked}
            disabled={checkButton}
          >
            {authenticationMode}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
