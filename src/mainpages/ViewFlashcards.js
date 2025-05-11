import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { FlashcardArray } from 'react-quizlet-flashcard';
import './Flashcards.css';
import { FaLightbulb } from 'react-icons/fa';

const API_KEY = 'Your OpenAI API Key'; // Replace with your actual API key

const ViewFlashcards = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState({ question: '', answer: '' });
  const [explanation, setExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // If no user, wait for auth state to change
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && listId) {
          loadFlashcardData(user.uid);
        }
      });
      return () => unsubscribe();
    } else if (listId) {
      loadFlashcardData(user.uid);
    }
  }, [listId]);

  const loadFlashcardData = (userId) => {
    const listRef = ref(database, `users/${userId}/flashcard-lists/${listId}`);
    const unsubscribe = onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setList(data);
        if (data.cards) {
          const cardsArray = Object.entries(data.cards).map(
            ([cardId, card]) => ({
              ...card,
              cardId,
              frontHTML: `<div><div class="card-content"><h3>Question:</h3><p>${card.question}</p></div>
              <div class="flip-hint"><p>Click to flip</p></div></div>`,
              backHTML: `<div><div class="card-content"><h3>Answer:</h3><p>${card.answer}</p></div>
              <div class="flip-hint"><p>Click to flip</p></div></div>`,
            })
          );
          setCards(cardsArray);
        } else {
          setCards([]);
        }
      }
    });
    return unsubscribe;
  };

  const handleCardChange = (index) => {
    setCurrentCardIndex(index);
    setIsEditing(false);
  };

  const startEditing = () => {
    const currentCard = cards[currentCardIndex];
    if (currentCard) {
      setEditedCard({
        question: currentCard.question,
        answer: currentCard.answer
      });
      setIsEditing(true);
    }
  };

  const saveEdit = async () => {
    if (!cards[currentCardIndex]) return;

    const user = auth.currentUser;
    if (!user) return;

    const cardId = cards[currentCardIndex].cardId;
    const cardRef = ref(database, `users/${user.uid}/flashcard-lists/${listId}/cards/${cardId}`);

    try {
      await update(cardRef, {
        ...cards[currentCardIndex],
        question: editedCard.question,
        answer: editedCard.answer
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const deleteCurrentCard = async () => {
    if (!cards[currentCardIndex]) return;

    const user = auth.currentUser;
    if (!user) return;

    const cardId = cards[currentCardIndex].cardId;
    const cardRef = ref(database, `users/${user.uid}/flashcard-lists/${listId}/cards/${cardId}`);

    try {
      await remove(cardRef);
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const getAIExplanation = async () => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    setIsLoadingExplanation(true);
    setShowExplanation(true);

    try {
      const prompt = `Q: ${currentCard.question}\nA: ${currentCard.answer}\n\nExplain why this answer is correct in 2-3 sentences.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-0125-preview',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 150,
          presence_penalty: 0.6
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const data = await response.json();
      const explanation = data.choices[0].message.content.trim();
      setExplanation(explanation);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setExplanation('Failed to get explanation. Please try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  if (!list) {
    return <div className="flashcards-content">Loading...</div>;
  }

  const handleDeleteFlashcards = async () => {
  await deleteCurrentCard();
  setShowDeleteModal(false);
};


  return (
    <div className="flashcards-content">
      <div className="flashcards-header">
        <div className="header-left">
          <button
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);  // Return to flashcard view if editing
              } else {
                window.history.back();  // Otherwise go back to list
              }
            }}
            className="aigeneratedback-button"
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
          </button>
          <h1>
            {isEditing 
              ? `Edit card in ${list.name}`
              : list.name
            }
          </h1>
        </div>
        {!isEditing && (
          <div className="header-buttons">
            <button
              className="add-cards-button"
              onClick={() => navigate(`/Dashboard/createflashcards/${listId}`)}
            >
              Add More Cards
            </button>
            <button
              className="edit-card-button"
              onClick={startEditing}
              disabled={cards.length === 0}
            >
              Edit Card
            </button>
            <button
              className="delete-card-button"
              onClick={() => setShowDeleteModal(true)}
              disabled={cards.length === 0}
            >
              Delete Current Card
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal - OUTSIDE THE MAP */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <div className="notesjsmessage">
              <p>Are you sure you want to delete this card?</p>
            </div>
            <button className="confirm-delete" onClick={handleDeleteFlashcards}>
              Yes, Delete
            </button>
            <button
              className="cancel-delete"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {list.description && (
        <div className="list-description">
          <p>{list.description}</p>
        </div>
      )}

      {!isEditing ? (
        <>
          {cards.length > 0 ? (
            <div className="flashcard-viewer">
              <FlashcardArray
                cards={cards}
                frontContentStyle={{ color: "white", backgroundColor: "black", width: "100%", height: "100%" }}
                backContentStyle={{ color: "white", backgroundColor: "black", width: "100%", height: "100%" }}
                frontBgColor="black"
                backBgColor="black"
                frontTextColor="white"
                backTextColor="white"
                cardWidth={400}
                cardHeight={250}
                autoPlay={false}
                showNextPrevButtons={true}
                onChange={handleCardChange}
                style={{ width: "100%" }}
              />

              <div className="explanation-section">
                <button
                  className="explanation-button"
                  onClick={getAIExplanation}
                  disabled={isLoadingExplanation}
                >
                  <FaLightbulb />{" "}
                  {isLoadingExplanation
                    ? "Getting Explanation..."
                    : "Get AI Explanation"}
                </button>
                {showExplanation && (
                  <div className="explanation-panel">
                    <h3>AI Explanation:</h3>
                    <p>{explanation || "Loading..."}</p>
                    <button
                      className="close-explanation"
                      onClick={() => setShowExplanation(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-cards-message">No cards in this list yet.</div>
          )}
        </>
      ) : (
        <div className="edit-card-form">
          <div className="form-group">
            <label>Question:</label>
            <textarea
              value={editedCard.question}
              onChange={(e) =>
                setEditedCard({ ...editedCard, question: e.target.value })
              }
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Answer:</label>
            <textarea
              value={editedCard.answer}
              onChange={(e) =>
                setEditedCard({ ...editedCard, answer: e.target.value })
              }
              rows="3"
            />
          </div>
          <div className="edit-form-actions">
            <button onClick={saveEdit} className="save-edit-button">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewFlashcards; 