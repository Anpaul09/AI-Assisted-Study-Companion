import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./Country.css"; // import the css file 

const CountryGame = () => {
  const [countriesData, setCountriesData] = useState([]); // this saves the all the countries data for this game
  const [quizQuestions, setQuizQuestions] = useState([]); // this saves the questions for the game which will take 10 questions in a round
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // this saves the question index
  const [score, setScore] = useState(0); // this saves the user's score while the user is playing a game
  const [userAnswer, setUserAnswer] = useState(null); // this saves the user's chosen answer
  const [isAnswered, setIsAnswered] = useState(false); // this checks if the user chosen an answer while playing the game
  const [isLoading, setIsLoading] = useState(true); // the loading state
  const [hasGameStarted, setHasGameStarted] = useState(false); // knowing if the game has started or not
  const [isGameOver, setIsGameOver] = useState(false); // this checks to know if the game as been completed (10 questions makes a complete round of game)
  const [userAnswers, setUserAnswers] = useState([]); // this saves the user's answers while playing the game to be used later
  const [selectedContinent, setSelectedContinent] = useState(null); // this saves the user's selected continent when they pick at the beginning of the game
  const [showBackPopup, setShowBackPopup] = useState(false); // this is for the pop up message that the user get when they click the back button while playing the game
  // this is the list of continents the user can choose from
  const [continentsList, setContinentsList] = useState([
    "Africa",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania",
  ]);

  // this is the game REST countries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();

        // these are filtered out and gotten from the data that is used during the game
        const formattedData = data
          .filter((country) => country.flags?.png && country.name?.common)
          .map((country) => ({
            flag: country.flags.png, // this is the country's flag picture
            name: country.name.common, // this is the country's name
            continent: country.region, // this is the country's region
            subregion: country.subregion, // this is the country's subregion
          }));

        setCountriesData(formattedData); // this saves the filtered countries
        setIsLoading(false); // the loading stat is set to false
      } catch (error) {
        // console.error("Could not load any countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // this will generate 10 questions for each continent if selected by the user
  const generateQuizQuestions = (countries) => {
    let filteredCountries = [];

    // this is for the continent because it is saved differently in the API, so filtering has to be done
    if (selectedContinent === "North America") {
      filteredCountries = countries.filter(
        (country) =>
          country.subregion === "Northern America" ||
          country.subregion === "Caribbean" ||
          country.subregion === "Central America"
      );
    } else if (selectedContinent === "South America") {
      filteredCountries = countries.filter(
        (country) => country.subregion === "South America"
      );
    } else {
      filteredCountries = countries.filter(
        (country) => country.continent === selectedContinent
      );
    }

    // if there are not up to 10 countries for a continent chosen, return empty
    if (filteredCountries.length < 10) return [];

    const questions = [];
    const usedCountries = new Set(); // this helps in a country not appearing a lot of times in a game round

    // will create 10 questions
    for (let i = 0; i < 10; i++) {
      let randomCountry;

      // this will keep picking a random country
      do {
        randomCountry =
          filteredCountries[
            Math.floor(Math.random() * filteredCountries.length)
          ];
      } while (usedCountries.has(randomCountry.name));

      usedCountries.add(randomCountry.name);

      // this will have the correct answer country
      const options = [randomCountry.name];

      // this will add four more countries so the options will be five
      while (options.length < 5) {
        const randomOption =
          filteredCountries[
            Math.floor(Math.random() * filteredCountries.length)
          ].name;
        if (!options.includes(randomOption)) {
          options.push(randomOption);
        }
      }

      // the options are shuffled with both the wrong and correct answers
      const shuffledOptions = options.sort(() => Math.random() - 0.5);

      // this will save the flag, name and options
      questions.push({
        flag: randomCountry.flag,
        country: randomCountry.name,
        options: shuffledOptions,
      });
    }

    return questions;
  };

  // If the user selects an answer
  const handleAnswerSelection = (selectedAnswer) => {
    // this will not allow the user to pick another answer after the user has picked a previous answer already
    if (!isAnswered) {
      setUserAnswer(selectedAnswer);
      setIsAnswered(true);
      setUserAnswers([...userAnswers, selectedAnswer]); // save the user's answer

      // the user's score increases if the answer the user chose is correct
      if (selectedAnswer === quizQuestions[currentQuestionIndex].country) {
        setScore(score + 1);
      }
    }
  };

  // this will move to the next question or end the game (game complete)
  const moveToNextQuestion = () => {
    const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true); // after 10 questions the results is displayed to the user
    }
  };

  // the game is reset so the user can play a new round of game
  const resetGameState = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer(null);
    setIsAnswered(false);
    setIsGameOver(false);
    setUserAnswers([]);
    setSelectedContinent(null);
    setQuizQuestions([]);
  };

  // the game start after a continent is picked
  const startGame = () => {
    if (selectedContinent) {
      const newQuestions = generateQuizQuestions(countriesData);

      // this ensures there are enough questions to start a round of game
      if (newQuestions.length > 0) {
        setQuizQuestions(newQuestions);
        setHasGameStarted(true);
      }
    }
  };

  // the user chooses a continent
  const handleContinentSelection = (continent) => {
    setSelectedContinent(continent);
  };

  // exit the game and the game is reset
  const exitGame = () => {
    resetGameState();
    setHasGameStarted(false);
  };

  // this will show a pop message when the user clicks the back button
  const handleBackButtonClick = () => {
    setShowBackPopup(true);
  };

  // when the user confirms to exit the game
  const confirmExitGame = () => {
    resetGameState();
    setHasGameStarted(false);
    setShowBackPopup(false);
  };

  // when the user cancels to exit the game
  const cancelExitGame = () => {
    setShowBackPopup(false);
  };

  // the loading state
  if (isLoading) return <div>Loading...</div>;

  // This will show the list of continent before the game starts
  if (!hasGameStarted) {
    return (
      <div className="countryGameStartPage">
        <h1>Play the Guess the Country Flag</h1>
        <h2>Pick a Continent:</h2>
        <div className="continent-buttons">
          {continentsList.map((continent, index) => (
            <button
              key={index}
              onClick={() => handleContinentSelection(continent)}
              className={`continent-button ${
                selectedContinent === continent ? "selected" : ""
              }`}
            >
              {continent}
            </button>
          ))}
        </div>
        <button className="countryStartButton" onClick={startGame}>
          Play
        </button>
      </div>
    );
  }

  // After the game is completed, it shows the user's score, the wrong and correct answers
  if (isGameOver) {
    return (
      <div className="countryGameResultPage">
        <h2>Guess the Country Flag</h2>
        <p>
          Your score: {score} / {quizQuestions.length}
        </p>

        <div className="countryGameResultList">
          {quizQuestions.map((question, index) => (
            <div key={index} className="countryGameResultItem">
              <img
                src={question.flag}
                alt="Flag"
                className="countryGameResultFlag"
              />
              <p>
                Correct Answer:{" "}
                <span style={{ color: "#38b53c" }}>{question.country}</span> |
                Your Answer:{" "}
                <span
                  style={{
                    color:
                      userAnswers[index] === question.country
                        ? "#38b53c"
                        : "#ec3629",
                  }}
                >
                  {userAnswers[index]}
                </span>
              </p>
              <p>
                {userAnswers[index] === question.country ? (
                  <FaCheck
                    className="icon correct-icon"
                    style={{ color: "#38b53c" }}
                  />
                ) : (
                  <FaTimes
                    className="icon incorrect-icon"
                    style={{ color: "#ec3629" }}
                  />
                )}
              </p>
            </div>
          ))}
        </div>

        <button className="countryResetButton" onClick={startGame}>
          Try Again
        </button>
        <button className="countryExitButton" onClick={exitGame}>
          Exit
        </button>
      </div>
    );
  }

  // if the questions (countries flag) is not enough, there will be an error message
  if (quizQuestions.length === 0) {
    return <div>No questions/countries available. Please try again later or pick a different continent.</div>;
  }

  const { flag, country, options } = quizQuestions[currentQuestionIndex];

  return (
    <div className="countryGame">
      {/* The back button */}
      <button onClick={handleBackButtonClick} className="countryGameBack">
        {/* the back button icon */}
        <svg
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

      {/* This is the popup message to confirm if the user want to exit the game */}
      {showBackPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>
              Are you sure you want to leave the game? Your progress will not be
              saved.
            </p>
            <div className="popup-buttons">
              <button onClick={confirmExitGame} className="countryGamePopup">
                Yes
              </button>
              <button onClick={cancelExitGame} className="countryGameCancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* the progress circles on the top that shows the user how many questions answered and how many is left to be answered */}
      <div className="progress-circles">
        {Array.from({ length: 10 }, (_, index) => (
          <div
            key={index}
            className={`circle ${
              index <= currentQuestionIndex ? "filled" : ""
            }`}
          />
        ))}
      </div>

      {/* shows the country flag */}
      <div className="flag">
        <img src={flag} alt="Flag" />
      </div>

      {/* shows the options for the country flag */}
      <div className="countryGameOptions">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelection(option)}
            disabled={isAnswered}
            className={`countryGameOption ${
              isAnswered
                ? option === country
                  ? "correct"
                  : option === userAnswer
                  ? "incorrect"
                  : ""
                : ""
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* shows the next button only after the user has answered the current question */}
      {isAnswered && (
        <button className="countryGameNext" onClick={moveToNextQuestion}>
          Next
        </button>
      )}
    </div>
  );
};

export default CountryGame;
