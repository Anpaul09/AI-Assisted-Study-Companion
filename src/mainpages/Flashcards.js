// src/mainpages/Flashcards.js
import React, { useState, useEffect } from 'react';
import './Flashcards.css';
import { FaArrowLeft} from "react-icons/fa";
import { auth, database } from '../config/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const Flashcards = ({ currentUser }) => {
  const [deleteFlashcardsId, setDeleteFlashcardsId] = useState(null);

  const navigate = useNavigate();
  const [flashcardLists, setFlashcardLists] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const listsRef = ref(database, `users/${user.uid}/flashcard-lists`);
      const unsubscribe = onValue(listsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listsArray = Object.values(data);
          // Sort lists: starred first, then by creation date
          listsArray.sort((a, b) => {
            if (a.starred === b.starred) {
              return b.createdAt - a.createdAt; // Newer first
            }
            return b.starred ? 1 : -1; // Starred first
          });
          setFlashcardLists(listsArray);
        } else {
          setFlashcardLists([]);
        }
      });
      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  const toggleStar = async (listId, isStarred) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await update(ref(database, `users/${user.uid}/flashcard-lists/${listId}`), {
          starred: !isStarred
        });
      } catch (error) {
        console.error("Error updating star status:", error);
      }
    }
  };

  const deleteList = async (listId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await remove(ref(database, `users/${user.uid}/flashcard-lists/${listId}`));
      } catch (error) {
        console.error("Error deleting flashcard list:", error);
        alert("Failed to delete flashcard list. Please try again.");
      }
    }
  };
const handleDeleteFlashcards = async () => {
  if (deleteFlashcardsId) {
    await deleteList(deleteFlashcardsId);
    setDeleteFlashcardsId(null);
  }
};

  return (
    <div className="flashcards-content">
      <div className="flashcards-header">
        <div className="header-left">
          <header>
            <div>
              {/* Button to navigate back to previous page */}
              <button
                onClick={() => {
                  window.location.href = "/Dashboard";
                }}
                // window.history.back(); // If no summary, go back in history
                // }}
                className="flashcardback-button"
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
          <div>
            {" "}
            <h1>My Flashcard Lists</h1>
          </div>
        </div>
        <div className="header-buttons">
          <button
            className="ai-generate-button"
            onClick={() => navigate("/Dashboard/aiflashcards")}
          >
            Create AI Flashcards
          </button>
          <button
            className="create-button"
            onClick={() => navigate("/Dashboard/createflashcards")}
          >
            Create Manual Flashcards
          </button>
        </div>
      </div>

      <div className="flashcards-list">
        {flashcardLists.length > 0 ? (
          flashcardLists.map((list) => (
            <div
              key={list.id}
              className={`flashcard-list-item ${list.starred ? "starred" : ""}`}
            >
              <div className="flashcard-list-content">
                <div className="list-header">
                  <h3>{list.name}</h3>
                  <button
                    className={`star-button ${list.starred ? "starred" : ""}`}
                    onClick={() => toggleStar(list.id, list.starred)}
                  >
                    <FaStar />
                  </button>
                </div>
                <p>{list.description}</p>
                <div className="cards-count">
                  {list.cards ? Object.keys(list.cards).length : 0} cards
                </div>
              </div>
              <div className="flashcard-list-actions">
                <button
                  className="view-button"
                  onClick={() => navigate(`/Dashboard/flashcards/${list.id}`)}
                >
                  View Cards
                </button>
                <button
                  className="delete-button"
                  onClick={() => setDeleteFlashcardsId(list.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-cards-message">
            No flashcard lists available. Create a new list to get started!
          </div>
        )}

        {/* Custom Delete Confirmation Modal - OUTSIDE THE MAP */}
        {deleteFlashcardsId && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <div className="notesjsmessage">
                <p>Are you sure you want to delete this flashcard?</p>
              </div>
              <button
                className="confirm-delete"
                onClick={handleDeleteFlashcards}
              >
                Yes, Delete
              </button>
              <button
                className="cancel-delete"
                onClick={() => setDeleteFlashcardsId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;