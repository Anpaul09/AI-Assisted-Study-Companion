import React, { useState, useEffect } from "react";
import "./FactGame.css"; // import the css file

function FactGame() {
  const [fact, setFact] = useState(""); // it saves the fact to be displayed to the user
  const [userScore, setUserScore] = useState(0); // it stores the user's correct answers
  const [answerFeedback, setAnswerFeedback] = useState(""); // it gives the user answer feedback after each answer
  const [questionCount, setQuestionCount] = useState(0); // it counts how many questions have been answered by the user 
  const [isGameOver, setIsGameOver] = useState(false); // it checks to know if the game has ended

  
  const getFact = async () => {
    try {
      const response = await fetch(
        "" // use your  API for this game to get the fact
      );
      const data = await response.json();
      setFact(data.text); // the game will be updated with the new fact
    } catch (error) {
      setFact("No fact could be loaded. Please try again later!"); // error message
    }
  };

  // the first fact is displayed for the user when the game starts
  useEffect(() => {
    getFact();
  }, []);

  /* User will select the answer on the fact */
  const handleUserAnswer = (isFact) => {
    // there will no be any game after the user reaches 20 questions
    if (isGameOver || questionCount >= 20) return;

    // Randomly
    const correct = Math.random() < 0.5;

    // check to confirm if user selected answer matches the "correct" answer
    if (correct === isFact) {
      setUserScore(userScore + 1); // the score increases if the user's answer is right
      setAnswerFeedback(" Correct!");
    } else {
      setAnswerFeedback(" Wrong!");
    }

    // the questions number increases for every question answered by the user
    setQuestionCount(questionCount + 1);

  
    setTimeout(() => {
      setAnswerFeedback("");
      if (questionCount + 1 >= 20) {
        setIsGameOver(true); // the game is ended after 20 questions
      } else {
        getFact(); // if not up to 20 questions the questions will keep appearing
      }
    }, 1000);
  };

 
  const resetGame = () => {
    setUserScore(0);
    setQuestionCount(0);
    setAnswerFeedback("");
    setIsGameOver(false);
    getFact(); // when the game is reset, new questions will be gotten and it will appear
  };

  return (
    <div className="fact-game">
      {/* This is the button to navigate back to previous page */}
      <button
        onClick={() => window.history.back()} // go the previous page
        className="factGameBack"
      >
        <svg //this is the back button design
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "8px" }}
        >
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
        </svg>
        Back
      </button>
      {/* The game title */}
      <div class="factgame-game">
        <h1>💡Fact or Cap?</h1>
      </div>
      <div className="factgamefact-container">
        <p className="factgamefact">{fact || "Loading..."}</p>
      </div>
      {/* The game complete screen after 20 questions have been answered */}
      {isGameOver ? (
        <div className="factgamegame-over">
          <h2>Game Complete!</h2>
          <p className="factgamefinal-score">
            Final Score: {userScore} / {questionCount}
          </p>
          <button className="factgameplay-again" onClick={resetGame}>
            Play Again
          </button>
        </div>
      ) : (
        /* The game screen when the user is playing the game */
        <>
          {/* The buttons */}
          <div className="factgamebuttons">
            <button
              className="factgame-buttonb"
              onClick={() => handleUserAnswer(true)}
            >
              Fact
            </button>
            <button
              className="factgame-buttonu"
              onClick={() => handleUserAnswer(false)}
            >
              Fiction
            </button>
          </div>

          {/* if the answers is either wrong or correct the feedback message */}
          <p className="factgamefeedback">{answerFeedback}</p>

          {/* the game info while the user is playing the game */}
          <div className="factgamestats">
            <p className="factgamescore">
              Score: {userScore} / {questionCount}
            </p>
            <p className="factgameremaining">
              Questions Left: {20 - questionCount}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default FactGame;
