
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { database } from '../config/firebase';
import { ref, push, onValue, set, remove } from 'firebase/database';
import './Notes.css';

const NotesPanel = ({ currentUser }) => {
  console.log("Current user in NotesPanel:", currentUser);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' }); // Custom message state
  const [deleteNoteId, setDeleteNoteId] = useState(null); // Track the note ID for deletion confirmation

  // Fetch notes from Firebase
  useEffect(() => {
    if (currentUser) {
      const notesRef = ref(database, `users/${currentUser.uid}/notes`);
      onValue(notesRef, (snapshot) => {
        const notesData = snapshot.val();
        if (notesData) {
          const notesList = Object.keys(notesData).map((key) => ({
            id: key,
            ...notesData[key],
          }));
          setNotes(notesList);
        } else {
          setNotes([]);
        }
      });
    }
  }, [currentUser]);

  // Save note
  const handleSaveNote = async () => {
    if (!currentUser) {
      setMessage({ text: "You must be logged in to save notes!", type: "error" });
      return;
    }
    if (note.trim() === '') {
      setMessage({ text: "Note cannot be empty!", type: "error" });
      return;
    }
    try {
      const notesRef = ref(database, `users/${currentUser.uid}/notes`);
      const newNoteRef = push(notesRef);
      await set(newNoteRef, {
        content: note,
        timestamp: new Date().toISOString(),
      });
      setNote('');
      setMessage({ text: "✅ Note saved successfully!", type: "success" });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving note:', error);
      setMessage({ text: "❌ Error saving note. Try again!", type: "error" });
    }
  };

  // Delete note
  const handleDeleteNote = async () => {
    if (!currentUser || !deleteNoteId) return;

    try {
      const noteRef = ref(database, `users/${currentUser.uid}/notes/${deleteNoteId}`);
      await remove(noteRef);
      setNotes(notes.filter(note => note.id !== deleteNoteId));
      setMessage({ text: "🗑️ Note deleted successfully!", type: "success" });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting note:', error);
      setMessage({ text: "❌ Error deleting note. Try again!", type: "error" });
    }

    setDeleteNoteId(null); // Close the modal
  };

  if (!currentUser) {
    return <p>You must be logged in to save notes!</p>;
  }

  return (
    <div className="notes-panelquiz">
      <div className="mynotesmessage">
        {" "}
        <h3>My Notes</h3>{" "}
      </div>
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
      <ReactQuill value={note} onChange={setNote} />
      <button class="noteButton" onClick={handleSaveNote}>
        Save Note
      </button>
      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-item">
            <ReactQuill value={note.content} readOnly={true} />
            <div className="notescreatedby"> <p>Created on: {new Date(note.timestamp).toLocaleString()}</p> </div>
            <button
              className="delete-button"
              onClick={() => setDeleteNoteId(note.id)} // Open the modal
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteNoteId && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <div className="notesjsmessage">
              {" "}
              <p>Are you sure you want to delete this note?</p>{" "}
            </div>
            <button className="confirm-delete" onClick={handleDeleteNote}>
              Yes, Delete
            </button>
            <button
              className="cancel-delete"
              onClick={() => setDeleteNoteId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPanel;
