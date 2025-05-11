// src/mainpages/Games.js
import React from "react";
import "./Games.css"; // import the css file 
import { useNavigate } from "react-router-dom";
import CountryFlag from "./worldmap.jpg"; // image for the country flag game
import CategorySorting from "./sortinggame.jpg"; // image for the category sorting game
import Fact from "./factORFiction.jpg"; // image for the fact or cap game
import VocabuQuiz from "./vocabulary.png"; // image for the vocabulary game

function Games() {
  const navigate = useNavigate(); // navigate to different routes

  const games = [
    {
      name: "Vocabulary Quiz", // the name of the game
      image: VocabuQuiz, // the image
      path: "/VocabQuiz", // the path of the game
    },
    {
      name: "Guess the Country Flag", // the name of the game
      image: CountryFlag, // the image
      path: "/Country", // the path of the game
    },
    {
      name: "Category Sorting", // the name of the game
      image: CategorySorting, // the image
      path: "/CategorySortingGame", // the path of the game
    },
    {
      name: "Fact or Caps", // the name of the game
      image: Fact, // the image
      path: "/FactGame", // the path of the game
    },
  ];

  return (
    /* This is the main container for games page */
    <div className="gamesjspage">
      {games.map((game, index) => (
        /* Each game */
        <div key={index} className="gamesIcon">
          <div className="image-container">
            {/* Game picture */}
            <img src={game.image} alt={game.name} className="gamesPicture" />
            {/* This the overlay that appears on game when it is hovered on */}
            <div className="gameOverlay">
              <button
                className="playButton"
                onClick={() => navigate(game.path)} // This will navigate to game page click
              >
                Play Now
              </button>
            </div>
          </div>
          <h3 className="gamesName">{game.name}</h3> {/* Game name */}
        </div>
      ))}
    </div>
  );
}

export default Games;
