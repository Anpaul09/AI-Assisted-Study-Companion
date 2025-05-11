

// src/games/CategorySortingGame.js
import React, { useState, useEffect } from "react";
import "./CategorySortingGame.css";
import { getCategorySortingGame } from "../api/chatgptApi";

const CategorySortingGame = ({ currentUser }) => {
  const [stage, setStage] = useState("enterCategory"); // Start directly at enterCategory
  const [userPrompt, setUserPrompt] = useState("");
  const [categories, setCategories] = useState({});
  const [items, setItems] = useState([]);
  const [sortedItems, setSortedItems] = useState({});
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log("Component mounted, stage:", stage); // Debug mount

  const fetchGameData = async () => {
    if (!userPrompt.trim()) {
      setMessage("Please enter a category!");
      return;
    }
    setLoading(true);
    console.log("Fetching game data for:", userPrompt);
    try {
      const data = await getCategorySortingGame(userPrompt);
      console.log("API Response:", data);
      if (!data || !data.categories || !data.items) {
        throw new Error("Invalid data returned from API");
      }
      setCategories(data.categories);
      const gameItems = shuffleArray(data.items);
      setItems(gameItems);
      setSortedItems(
        Object.keys(data.categories).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
      );
      const total = gameItems.length * 10;
      setTotalPoints(total);
      setStage("play");
      setScore(0);
      setTimeLeft(60);
      setGameOver(false);
      setMessage("");
    } catch (error) {
      setMessage("Oops! Couldn’t generate the game. Try again!");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (stage === "play" && timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setMessage("Time’s up! Game Over!");
    }
  }, [stage, timeLeft, gameOver]);

  const handleDragStart = (e, item) => {
    console.log("Dragging:", item);
    e.dataTransfer.setData("text", item);
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    const item = e.dataTransfer.getData("text");
    console.log("Dropped", item, "into", category);
    if (categories[category].includes(item)) {
      setSortedItems((prev) => ({
        ...prev,
        [category]: [...prev[category], item],
      }));
      setItems((prev) => prev.filter((i) => i !== item));
      const points = 10;
      setScore((prev) => prev + points);
      setMessage(`Nice one! +${points} points`);
      if (items.length === 1) {
        setGameOver(true);
        setMessage("Woohoo! You sorted it all!");
      }
    } else {
      setMessage("Wrong spot! Try again!");
    }
  };

  const handleExit = () => {
    setStage("enterCategory"); // Return to enterCategory instead of selectGame
    setUserPrompt("");
    setCategories({});
    setItems([]);
    setSortedItems({});
    setScore(0);
    setTotalPoints(0);
    setTimeLeft(60);
    setMessage("");
    setGameOver(false);
  };

  // Removed the "selectGame" stage entirely
  if (stage === "enterCategory") {
    return (
      <div className="game-container">
        <h2>Create Your Category Sorting Game!</h2>
        <p>Type a category (e.g., "Fruits," "Cars," "Sports"):</p>
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Enter a category..."
          className="category-input"
        />
        <button
          className="start-button bounce"
          onClick={fetchGameData}
          disabled={loading}
        >
          {loading ? "Generating..." : "Start Sorting!"}
        </button>
        {message && <p className="message error">{message}</p>}
      </div>
    );
  }

  return (
    <div className="game-container">
      <h2>Sort the {userPrompt}!</h2>
      <div className="game-stats">
        <p>
          Score: {score}/{totalPoints}
        </p>
        <p>Time Left: {timeLeft}s</p>
      </div>
      <div className="items">
        {items.map((item) => (
          <div
            key={item}
            className="draggable-item bounce"
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="categories">
        {Object.keys(categories).map((category) => (
          <div
            key={category}
            className="category-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, category)}
          >
            <h3>{category}</h3>
            <div className="sorted-items">
              {sortedItems[category].map((item, idx) => (
                <div key={idx} className="sorted-item pop">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!gameOver && (
        <button className="exit-button" onClick={handleExit}>
          Exit Game
        </button>
      )}
      {message && (
        <p
          className={`message ${
            message.includes("Wrong") ? "error" : "success"
          }`}
        >
          {message}
        </p>
      )}
      {gameOver && (
        <div className="game-over">
          <div className="game-overmessage">
            {" "}
            <h3>{message}</h3>
            <p>
              Your Score: {score}/{totalPoints}
            </p>{" "}
          </div>
          <div className="game-overbutton">
            {" "}
            <button onClick={fetchGameData}>Replay</button>{" "}
          </div>
          <div className="game-overbutton">
            {" "}
            <button onClick={() => setStage("enterCategory")}>
              New Category
            </button>{" "}
          </div>
          <button className="exit-button" onClick={handleExit}>
            Exit
          </button>
        </div>
      )}
    </div>
  );
};

export default CategorySortingGame;
