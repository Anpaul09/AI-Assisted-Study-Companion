import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { ref, set } from 'firebase/database';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import mammoth from 'mammoth';
import './Flashcards.css';

const AIFlashcards = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [cardCount, setCardCount] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const maxWords = 3000;
  const API_KEY = 'Your OpenAI API Key'; // Replace with your actual API key

  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

  const handleTextChange = (e) => {
    const newText = e.target.value;
    const wordCount = newText.trim().split(/\s+/).length;
    
    if (wordCount <= maxWords) {
      setText(newText);
      setPdfText('');
      setSelectedFile(null);
      setErrorMessage('');
    } else {
      setErrorMessage(`Please keep text under ${maxWords} words`);
    }
  };

  const handleFileUpload = async (file) => {
    setSelectedFile(file);
    setText(''); // Clear text input when file is selected
    
    if (file.type === 'application/pdf') {
      await handlePdfUpload(file);
    } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      await handleWordUpload(file);
    }
  };

  const handlePdfUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const uint = new Uint8Array(event.target.result);
      const pdf = await pdfjsLib.getDocument({ data: uint }).promise;
      let doctext = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        doctext += content.items.map(item => item.str).join(' ');
      }

      setPdfText(doctext);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleWordUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        setPdfText(result.value);
      } catch (error) {
        setErrorMessage('Error reading Word document');
        console.error('Error reading Word document:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleGenerateFlashcards = async () => {
    // Clear previous error messages
    setErrorMessage('');
    
    // Check if both text and file are empty
    if (!text.trim() && !selectedFile) {
      setErrorMessage("Please enter text or upload a PDF file to generate flashcards");
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    const contentToUse = pdfText || text;

    const prompt = `Create exactly ${cardCount} flashcards from this text: ${contentToUse}. 
    Return only pure JSON (no markdown, no backticks) with this structure:
    {
      "flashcards": [
        {
          "question": "Question 1",
          "answer": "Answer 1"
        }
      ]
    }
    Make questions clear and concise. Generate exactly ${cardCount} flashcards, no more and no less.`;

    try {
      console.log('Making API request...');
      const res = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response from API');
      }

      let contentStr = data.choices[0].message.content.trim();
      if (contentStr.startsWith('```')) {
        contentStr = contentStr
          .replace(/^```json\s*/, '')
          .replace(/```\s*$/, '')
          .trim();
      }
      
      const flashcardsData = JSON.parse(contentStr);
      
      if (!Array.isArray(flashcardsData.flashcards)) {
        throw new Error('Invalid flashcards data structure');
      }

      const user = auth.currentUser;
      if (!user) {
        throw new Error('Please sign in to save flashcards');
      }

      const listId = Date.now();
      const newList = {
        id: listId,
        name: listName,
        description: listDescription,
        createdAt: Date.now(),
        cards: {},
        starred: false
      };

      flashcardsData.flashcards.forEach((card, index) => {
        newList.cards[`card_${index}`] = {
          id: `card_${index}`,
          question: card.question,
          answer: card.answer,
          createdAt: Date.now()
        };
      });

      await set(ref(database, `users/${user.uid}/flashcard-lists/${listId}`), newList);
      setSuccessMessage('Flashcards generated and saved successfully!');
      setTimeout(() => {
        navigate('/Dashboard/flashcards');
      }, 2000);

    } catch (error) {
      console.error('Error generating flashcards:', error);
      setErrorMessage(error.message || 'Failed to generate flashcards. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setLoading(false);
      // Reset error state to allow button to be clickable again
      setErrorMessage('');
    }
  };

  return (
    <div className="flashcards-content">
      <div className="flashcards-header">
        <div className="header-left">
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
          <h1>Create AI Generated Flashcards</h1>
        </div>
      </div>

      <div className="create-list-form">
        <div className="flashcardsform-group">
          <label>List Name:</label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
            className="list-input"
          />
        </div>
        <div className="flashcardsform-group">
          <label>Description (optional):</label>
          <textarea
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            placeholder="Enter list description"
            rows="2"
          />
        </div>
        <div className="createflashform-group number-input-group">
          <label>Number of flashcards to generate (Max: 20):</label>
          <input
            type="number"
            min="1"
            max="20"
            value={cardCount}
            onChange={(e) => setCardCount(Math.min(20, parseInt(e.target.value) || 1))}
            className="number-input"
          />
        </div>
        <div className="flashcardsform-group">
          <label>Enter text or upload a file (Max: 5MB):</label>
          <div className="input-options">
            <div className="input-wrapper">
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                style={{ display: "none" }}
              />
              <button
                className="file-upload-button"
                onClick={() => document.getElementById("fileInput").click()}
              >
                📝 Upload File
              </button>
              {selectedFile && (
                <span className="file-name">{selectedFile.name}</span>
              )}
            </div>
            <div className="or-divider">OR</div>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Enter the text you want to create flashcards from..."
              rows="10"
              className="ai-text-input"
              disabled={selectedFile !== null}
            />
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {!selectedFile && (
            <div className="word-count">
              Words: {text.trim() ? text.trim().split(/\s+/).length : 0} /{" "}
              {maxWords}
            </div>
          )}
        </div>
        <div className="form-actions">
          <button
            className="ai-generate-button"
            onClick={handleGenerateFlashcards}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIFlashcards; 




