




//modified for error handling 
import React, { useState, useEffect } from "react";
import "./VocabQuiz.css"; // import the css file

function VocabQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(null); // this saves the word and the meaning of the word
  const [answerChoices, setAnswerChoices] = useState([]); // this saves the options all four options
  const [userScore, setUserScore] = useState(0); // this saves the user's score while playing the game
  const [questionIndex, setQuestionIndex] = useState(0); // this will show what number of question the user is on
  const [feedbackMessage, setFeedbackMessage] = useState(""); // this shows whether the user answered the question correct or incorrect
  const [isLoading, setIsLoading] = useState(true); // this is the loading state
  const [quizStarted, setQuizStarted] = useState(false); // to know if the user has started the quiz or not
  const [quizCompleted, setQuizCompleted] = useState(false); // this will become true if the user finishes 10 questions in the quiz
  const [timeRemaining, setTimeRemaining] = useState(15); // this is the 15 seconds for each question in the game
  const [selectedAnswer, setSelectedAnswer] = useState(null); // this saves the option the user chooses

  // this is the timer
  useEffect(() => {
    if (!quizStarted || quizCompleted) return; // which will work when the quiz has started

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer); // the timer stops at 0
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // for every second

    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, questionIndex]);

  // get the word, its meaning and three wrong options
  const loadNewQuestion = async () => {
    setIsLoading(true); // the loading state
    setFeedbackMessage(""); // the previous result will be cleared
    setSelectedAnswer(null); // reset selected answer

    try {
      // get a random word from this API
      const wordRes = await fetch("");
      const [word] = await wordRes.json();

      // get the random word’s definition from this API (this is a dictionary)
      const defRes = await fetch(
        ``
      );
      const defData = await defRes.json();

      // if there are words that have no meaning it will not be selected for the quiz
      if (defData.title === "No Definitions Found") {
        loadNewQuestion();
        return;
      }

      // get the word's definition
      const definition = defData[0]?.meanings[0]?.definitions[0]?.definition;
      if (!definition) {
        loadNewQuestion(); // if there are words that have no meaning it will not be selected for the quiz
        return;
      }

      // get three other wrong options
      const fakeWordsRes = await fetch(
        ""
      );

      const fakeWords = await fakeWordsRes.json();

      // the correct and the wrong options will be combined together to make four options
      const shuffledAnswers = [word, ...fakeWords].sort(
        () => Math.random() - 0.5
      );

      // the word, defintion will be saved for a question in the quiz
      setCurrentQuestion({
        word,
        definition,
        partOfSpeech: defData[0]?.meanings[0]?.partOfSpeech || "",
      });

      setAnswerChoices(shuffledAnswers);
      setIsLoading(false); // the loading state
    } catch (error) {
      setFeedbackMessage("This is currently down. Please try again later."); //error message
      setIsLoading(false);
    }
  };

  // start a quiz round
  const startQuiz = () => {
    setQuizStarted(true);
    setQuizCompleted(false);
    setUserScore(0);
    setQuestionIndex(0);
    setTimeRemaining(15);
    loadNewQuestion();
  };

  // when the user select an answer
  const handleAnswerClick = (answer) => {
    if (selectedAnswer || quizCompleted) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.word; // checks to know if the answer selected is correct

    if (isCorrect) {
      setUserScore(userScore + 1); // the user's score increases
      setFeedbackMessage("Correct!");
    } else {
      setFeedbackMessage(`Incorrect! It was "${currentQuestion.word}"`);
    }

    // go to next question in the quiz
    setTimeout(() => {
      if (questionIndex < 9) {
        setQuestionIndex(questionIndex + 1);
        setTimeRemaining(15);
        loadNewQuestion(); // the next question in the quiz
      } else {
        setQuizCompleted(true); // show the user's score
      }
    }, 1500);
  };

  // if time reachs 0 for a question
  const handleTimeExpired = () => {
    if (currentQuestion && currentQuestion.word) {
      setFeedbackMessage(`Time's up! The answer was "${currentQuestion.word}"`);
    } else {
      setFeedbackMessage("Time's up! No word found.");
    }

    setTimeout(() => {
      if (questionIndex < 9) {
        setQuestionIndex(questionIndex + 1);
        setTimeRemaining(15);
        loadNewQuestion();
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };

  return (
    <div className="vocabquiz">
      {/* This is the button to navigate back to previous page */}
      <button
        onClick={() => {
          setQuizStarted(false);
          setQuizCompleted(false);
        }} // go the previous page
        className="vocabquiz-back-button"
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
      <h1>Vocabulary Quiz</h1>
      {/* this is the screen before the game starts */}
      {!quizStarted ? (
        <div className="vocabquiz-start-screen">
          <h2>Test Your Vocabulary Knowledge</h2>
          <p>10 questions | 15 seconds each</p>
          <button className="vocabquiz-start-button" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      ) : quizCompleted ? (
        // this is screen after the game has ended
        <div className="vocabquiz-results-screen">
          <h2>Quiz Complete!</h2>
          <p>Your score: {userScore} / 10</p>
          <button className="vocabquiz-restart-button" onClick={startQuiz}>
            Play Again
          </button>
        </div>
      ) : isLoading ? (
        // this will show while the user is waiting for the next question
        <div className="vocabquiz-loading">Loading question...</div>
      ) : (
        // the quiz screen
        <div className="vocabquiz-question-screen">
          {/* this shows the question no, timer and the score */}
          <div className="vocabquiz-header">
            <div className="vocabquiz-question-count">
              Question {questionIndex + 1} / 10
            </div>
            <div className="vocabquiz-timer">Time: {timeRemaining}s</div>
            <div className="vocabquiz-score">Score: {userScore}</div>
          </div>

          {/* the definition displayed for the word */}
          <div className="vocabquiz-definition">
            <h3>Definition:</h3>
            <p>{currentQuestion.definition}</p>
            {currentQuestion.partOfSpeech && (
              <p className="vocabquiz-part-of-speech">
                ({currentQuestion.partOfSpeech})
              </p>
            )}
          </div>

          {/* these are the options */}
          <div className="vocabquiz-options">
            {answerChoices.map((option, index) => (
              <button
                key={index}
                className={`vocabquiz-option-button ${
                  selectedAnswer === option
                    ? option === currentQuestion.word
                      ? "vocabquiz-correct"
                      : "vocabquiz-incorrect"
                    : ""
                }`}
                onClick={() => handleAnswerClick(option)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>

          {/* this will show either correct! or incorrect! */}
          <div className="vocabquiz-message">{feedbackMessage}</div>
        </div>
      )}
    </div>
  );
}

export default VocabQuiz;