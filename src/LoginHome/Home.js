import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundVideo from "./movie.mp4";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");

  const messages = [
    "Are you ready for the next generation of studying?",
    "Intelligent learning made simple.",
    "Study smarter, not harder.",
    "Your academic success starts here.",
  ];

  useEffect(() => {
    const fadeInterval = setInterval(() => {
      if (fadeState === "fade-in") {
        setFadeState("fade-out");
        setTimeout(() => {
          setCurrentMessage((prev) => (prev + 1) % messages.length);
          setFadeState("fade-in");
        }, 1000);
      }
    }, 4000);

    return () => clearInterval(fadeInterval);
  }, [fadeState, messages.length]);

  return (
    <div className="home-container">
      <div className="video-background">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-tag"
          poster="/fallback.jpg"
        >
          <source src={backgroundVideo} type="video/mp4" />
          <source src="/movie.webm" type="video/webm" />
          Your browser does not support video playback.
        </video>
        <div className="overlay"></div>
      </div>

      <div className="home-content">
        <h1 className="main-title">Welcome to StudyUp</h1>
        <p className={`flavor-text ${fadeState}`}>{messages[currentMessage]}</p>
        <button className="sign-in-button" onClick={() => navigate("/signup")}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;
