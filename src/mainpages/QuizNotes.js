import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Flashcards.css';
import { database } from '../config/firebase';
import { ref, onValue, update } from 'firebase/database';

const QuizNotes = ({ currentUser }) => {
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, noteIndex: null });

  useEffect(() => {
    if (!currentUser?.uid || !id) {
      console.log("Missing data:", { currentUser, id });
      setLoading(false);
      setError("Missing required information");
      return;
    }

    console.log("Attempting to fetch notes for quiz:", id);
    console.log("Current user:", currentUser.uid);
    
    const path = `users/${currentUser.uid}/quizResults/${id}`;
    console.log("Database path:", path);
    
    const quizRef = ref(database, path);
    const unsubscribe = onValue(quizRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Raw database response:", data);
      
      if (data) {
        // Parse notes into array of objects with title and content
        const notesArray = data.notes
          ? data.notes.split('\n\n')
            .filter(note => note.trim())
            .map(note => {
              try {
                return JSON.parse(note);
              } catch {
                // Handle old format notes
                return { title: 'Untitled Note', content: note };
              }
            })
          : [];
        
        console.log("Parsed notes array:", notesArray);
        setQuizData(data);
        setNotes(notesArray);
        setError(null);
      } else {
        console.log("No data found for quiz:", id);
        setError("No quiz data found");
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase error:", error);
      setError("Failed to load quiz data");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, id]);

  const validateQuillContent = (content) => {
    return content !== '<p><br></p>' && content.trim() !== '';
  };

  const handleAddNote = async () => {
    try {
      const updatedNotes = [...notes, { title: newNote.title, content: newNote.content }];
      
      // Join notes with double newlines and update Firebase
      const formattedNotes = updatedNotes.map(note => 
        JSON.stringify({ title: note.title, content: note.content })
      ).join('\n\n');
      
      const quizRef = ref(database, `users/${currentUser.uid}/quizResults/${id}`);
      await update(quizRef, { notes: formattedNotes });

      // Update local state
      setNotes(updatedNotes);
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
      
      console.log("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  const handleDeleteNote = async (indexToDelete) => {
    setDeleteConfirmation({ show: true, noteIndex: indexToDelete });
  };

  const confirmDelete = async () => {
    try {
      const indexToDelete = deleteConfirmation.noteIndex;
      const updatedNotes = notes.filter((_, index) => index !== indexToDelete);
      
      const formattedNotes = updatedNotes.map(note => 
        JSON.stringify({ title: note.title, content: note.content })
      ).join('\n\n');
      const quizRef = ref(database, `users/${currentUser.uid}/quizResults/${id}`);
      await update(quizRef, { notes: formattedNotes });

      setNotes(updatedNotes);
      setDeleteConfirmation({ show: false, noteIndex: null });
      console.log("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleEditNote = async (updatedNote, index) => {
    try {
      const updatedNotes = [...notes];
      updatedNotes[index] = updatedNote;
      
      // Update Firebase
      const formattedNotes = updatedNotes.map(note => 
        JSON.stringify({ title: note.title, content: note.content })
      ).join('\n\n');
      
      const quizRef = ref(database, `users/${currentUser.uid}/quizResults/${id}`);
      await update(quizRef, { notes: formattedNotes });

      // Update local state
      setNotes(updatedNotes);
      setEditingNote(null);
      console.log("Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flashcards-content">
        <div className="loading-message">Loading notes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcards-content">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flashcards-content">
        <div className="no-notes-message">No quiz data found.</div>
      </div>
    );
  }

  return (
    <div className="flashcards-content">
      <div className="flashcards-header">
        <div className="header-left">
          <button
            onClick={() => window.history.back()}
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
          <h1>Notes for {quizData.quizTitle}</h1>
        </div>
        <button 
          className="add-note-btn"
          onClick={() => setIsAddingNote(true)}
        >
          + Add Note
        </button>
      </div>

      {isAddingNote && (
        <div className="add-note-panel">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (validateQuillContent(newNote.content)) {
              handleAddNote();
            }
          }}>
            <input
              type="text"
              className="note-title-input"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              placeholder="Enter note title..."
              required
              title="Please enter a title for your note"
            />
            <div className="quill-container">
              <ReactQuill
                value={newNote.content}
                onChange={(content) => setNewNote({ ...newNote, content })}
                placeholder="Enter your note here..."
              />
              <textarea
                required
                value={newNote.content.replace(/<[^>]+>/g, '').trim()}
                onChange={() => {}}
                title="Please enter some content for your note"
                className="validation-textarea"
                aria-hidden="true"
                tabIndex="-1"
              />
            </div>
            <div className="note-actions">
              <button 
                type="button"
                className="cancel-note-btn"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote({ title: '', content: '' });
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="save-note-btn"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="quiz-notes-container">
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <div key={index} className="quiz-note-box">
              <div className="note-header">
                <div className="note-title">{note.title}</div>
                <div className="note-actions">
                  <button 
                    className="edit-note-btn"
                    onClick={() => setEditingNote({ ...note, index })}
                    title="Edit note"
                  >
                    ✎
                  </button>
                  <button 
                    className="delete-note-btn"
                    onClick={() => handleDeleteNote(index)}
                    title="Delete note"
                  >
                    ×
                  </button>
                </div>
              </div>
              <ReactQuill 
                value={note.content}
                readOnly={true}
                modules={{ toolbar: false }}
              />
            </div>
          ))
        ) : (
          <div className="no-notes-message">
            No notes were taken during this quiz.
          </div>
        )}
      </div>

      {editingNote !== null && (
        <div className="edit-note-modal">
          <div className="edit-note-content">
            <h3>Edit Note</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (validateQuillContent(editingNote.content)) {
                handleEditNote(editingNote, editingNote.index);
              }
            }}>
              <input
                type="text"
                className="note-title-input"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                placeholder="Enter note title..."
                required
                title="Please enter a title for your note"
              />
              <div className="quill-container">
                <ReactQuill
                  value={editingNote.content}
                  onChange={(content) => setEditingNote({ ...editingNote, content })}
                  placeholder="Enter your note here..."
                />
                <textarea
                  required
                  value={editingNote.content.replace(/<[^>]+>/g, '').trim()}
                  onChange={() => {}}
                  title="Please enter some content for your note"
                  className="validation-textarea"
                  aria-hidden="true"
                  tabIndex="-1"
                />
              </div>
              <div className="note-actions">
                <button 
                  type="button"
                  className="cancel-note-btn"
                  onClick={() => setEditingNote(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="save-note-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmation.show && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Delete Note</h3>
            <p>Are you sure you want to delete this note?</p>
            <div className="delete-modal-actions">
              <button 
                className="cancel-delete-btn"
                onClick={() => setDeleteConfirmation({ show: false, noteIndex: null })}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizNotes; 