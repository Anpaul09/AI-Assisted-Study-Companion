import React, { useState, useEffect } from 'react';
import { database } from '../config/firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import './Favorites.css';

const Favorites = ({ currentUser }) => {
  const [favorites, setFavorites] = useState({
    quizzes: [],
    flashcards: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // Fetch favorited quizzes
    const quizzesRef = ref(database, `users/${currentUser.uid}/quizResults`);
    const quizzesQuery = query(quizzesRef, orderByChild('timestamp'));

    // Use the correct path for flashcards
    const flashcardsRef = ref(database, `users/${currentUser.uid}/flashcard-lists`);

    const unsubscribeQuizzes = onValue(quizzesQuery, (snapshot) => {
      try {
        const quizData = snapshot.val();
        if (quizData) {
          const starredQuizzes = Object.entries(quizData)
            .filter(([_, quiz]) => quiz.starred)
            .map(([id, quiz]) => ({
              id,
              ...quiz
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          setFavorites(prev => ({ ...prev, quizzes: starredQuizzes }));
        } else {
          setFavorites(prev => ({ ...prev, quizzes: [] }));
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    });

    const unsubscribeFlashcards = onValue(flashcardsRef, (snapshot) => {
      try {
        const flashcardData = snapshot.val();
        console.log('Raw Flashcard Data:', flashcardData);

        if (flashcardData) {
          // Log each flashcard list and its starred status
          Object.entries(flashcardData).forEach(([id, list]) => {
            console.log(`Flashcard List ${id}:`, {
              name: list.name,
              starred: list.starred,
              type: typeof list.starred
            });
          });

          const starredFlashcards = Object.entries(flashcardData)
            .filter(([_, list]) => {
              // Log each filter check
              console.log('Checking list:', list.name, 'Starred:', list.starred, 'Type:', typeof list.starred);
              return list.starred === true;
            })
            .map(([id, list]) => {
              // Log each mapped item
              console.log('Mapping starred list:', list.name);
              return {
                id,
                ...list,
                cardCount: list.cards ? Object.keys(list.cards).length : 0
              };
            });
          
          console.log('Final Starred Flashcards:', starredFlashcards);
          setFavorites(prev => {
            const newState = { ...prev, flashcards: starredFlashcards };
            console.log('New Favorites State:', newState);
            return newState;
          });
        } else {
          console.log('No flashcard data found');
          setFavorites(prev => ({ ...prev, flashcards: [] }));
        }
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeQuizzes();
      unsubscribeFlashcards();
    };
  }, [currentUser]);

  const navigateToQuiz = (quizId) => {
    navigate(`/QuizHistory?highlight=${quizId}`);
  };

  const navigateToFlashcards = (listId) => {
    navigate(`/Dashboard/flashcards/${listId}`);
  };

  if (loading) {
    return <div className="favorites-loading">Loading favorites...</div>;
  }

  // Add logging to the render section
  console.log('Rendering Favorites with:', favorites);

  // Add this log right before the return statement
  console.log('Favorites state before render:', {
    quizLength: favorites.quizzes.length,
    flashcardsLength: favorites.flashcards.length,
    fullState: favorites
  });

  return (
    <div className="favorites-container">
      <header>
        <div>
          {/* Button to navigate back to previous page */}
          <button
            onClick={() => {
              window.history.back()
            }}
            // window.history.back(); // If no summary, go back in history
            // }}
            className="favoritesback-button"
          >
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
          </button>{" "}
        </div>
      </header>
      <h2>
        Your Favorites <FaStar className="favorites-title-star" />
      </h2>

      {/* Favorited Quizzes Section */}
      {favorites.quizzes.length > 0 && (
        <div className="favorites-section">
          <h3>Favorited Quizzes ({favorites.quizzes.length})</h3>
          <div className="favorites-grid">
            {favorites.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="favorite-item quiz"
                onClick={() => navigateToQuiz(quiz.id)}
              >
                <FaStar className="favorite-star" />
                <h4>{quiz.quizTitle || "Untitled Quiz"}</h4>
                <p>Score: {Number(quiz.score).toFixed(2)}%</p>
                <p className="date">
                  Created: {new Date(quiz.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flashcards Section - only show if there are favorites */}
      {favorites.flashcards.length > 0 && (
        <div className="favorites-section">
          <h3>Favorited Flashcard Sets ({favorites.flashcards.length})</h3>
          <div className="favorites-grid">
            {favorites.flashcards.map((list) => (
              <div
                key={list.id}
                className="favorite-item flashcard"
                onClick={() => navigateToFlashcards(list.id)}
              >
                <FaStar className="favorite-star" />
                <h4>{list.name}</h4>
                <p>{Object.keys(list.cards || {}).length} cards</p>
                {list.description && (
                  <p className="description">{list.description}</p>
                )}
                <p className="date">
                  Created: {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {favorites.quizzes.length === 0 && favorites.flashcards.length === 0 && (
        <div className="no-favorites">
          <p>You haven't favorited any quizzes or flashcards yet.</p>
          <p>Star items to add them to your favorites!</p>
        </div>
      )}
    </div>
  );
};

export default Favorites; 