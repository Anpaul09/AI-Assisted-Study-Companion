import React, { useState, useEffect } from 'react';
import { auth, database } from '../config/firebase';
import { ref, set, push, onValue } from 'firebase/database';
import { useNavigate, useParams } from 'react-router-dom';
import './Flashcards.css';

const CreateFlashcards = () => {
  const navigate = useNavigate();
  const { listId } = useParams();
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [showCreateList, setShowCreateList] = useState(!listId);
  const [currentListId, setCurrentListId] = useState(listId || null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingList, setExistingList] = useState(null);

  // Fetch existing list data if editing
  useEffect(() => {
    if (listId) {
      const user = auth.currentUser;
      if (user) {
        const listRef = ref(database, `users/${user.uid}/flashcard-lists/${listId}`);
        onValue(listRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setExistingList(data);
            setListName(data.name);
            setListDescription(data.description || '');
          }
        });
      }
    }
  }, [listId]);

  // Create a new flashcard list
  const createList = async () => {
    if (!listName.trim()) {
      setErrorMessage("Please enter a list name");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    const user = auth.currentUser;
    
    if (!user) {
      setErrorMessage("Please sign in to create flashcard lists.");
      setIsSubmitting(false);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const newListId = Date.now();
      const newList = {
        id: newListId,
        name: listName,
        description: listDescription,
        createdAt: Date.now(),
        cards: {},
        starred: false
      };

      await set(ref(database, `users/${user.uid}/flashcard-lists/${newListId}`), newList);
      setCurrentListId(newListId);
      setShowCreateList(false);
      setListName('');
      setListDescription('');
      setSuccessMessage('List created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error creating list:", error);
      setErrorMessage("Failed to create list. Please try again.");
      setTimeout(() => setErrorMessage(''), 3000);
      setListName('');
      setListDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new flashcard to the current list
  const addFlashcard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setErrorMessage("Please enter both question and answer");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!currentListId) {
      setErrorMessage("No list selected. Please create a new list first.");
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    const user = auth.currentUser;
    
    if (!user) {
      setErrorMessage("Please sign in to add flashcards.");
      setIsSubmitting(false);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const newCard = {
        id: Date.now(),
        question: newQuestion,
        answer: newAnswer,
        createdAt: Date.now()
      };

      const cardsRef = ref(database, `users/${user.uid}/flashcard-lists/${currentListId}/cards`);
      await push(cardsRef, newCard);
      setNewQuestion('');
      setNewAnswer('');
      setSuccessMessage('Flashcard added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error adding flashcard:", error);
      setErrorMessage("Failed to save flashcard. Please try again.");
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      navigate('/Dashboard/flashcards');
    }
  };

  return (
    <div className="flashcards-content">
      <div className="flashcards-header">
        <div className="header-left">
          {/* <button 
            className="back-button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            ← Back
          </button> */}
          <button
            onClick={() => {
              window.history.back(); // If no summary, go back in history
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
            {existingList
              ? `Add Cards to ${existingList.name}`
              : showCreateList
              ? "Create New Flashcard List"
              : "Add Flashcards to List"}
          </h1>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {showCreateList ? (
        <div className="create-list-form">
          <div className="createflashform-group">
            <label>List Name:</label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name"
              className="list-input"
              disabled={isSubmitting}
            />
          </div>
          <div className="createflashform-group">
            <label>Description (optional):</label>
            <textarea
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Enter list description"
              rows="2"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-actions">
            <button onClick={createList} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create List"}
            </button>
          </div>
        </div>
      ) : (
        <div className="create-flashcard-form">
          <div className="createflashform-group">
            <label>Question:</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter your question"
              rows="3"
              disabled={isSubmitting}
            />
          </div>
          <div className="createflashform-group">
            <label>Answer:</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter the answer"
              rows="3"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-actions">
            <button
              onClick={addFlashcard}
              disabled={isSubmitting}
              className="add-card-button"
            >
              {isSubmitting ? "Adding..." : "Add New Card"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFlashcards; 


