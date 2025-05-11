import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import Quiz from 'react-quiz-component';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ref, set, get, push } from 'firebase/database';
import { database } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import "./Quizzes.css";
import NotesPanel from './NotesPanel';
import { FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import folderIcon from './icons/folder.png';
import micIcon from './icons/mic.png';
import circleIcon from './icons/circle.png';
import loadIcon from './icons/load.png';
import exitIcon from './icons/exit.png';
import plusIcon from './icons/plus.png';
import backIcon from './icons/back.png';
import shareIcon from './icons/share.png';
import printIcon from './icons/print.png';
import notesIcon from './icons/notes.png';

// DO NOT DELETE THIS THIS PARSES ALL THE PDFS
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

// Helper function to extract JSON from text response
const extractJSON = (text) => {
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No valid JSON found in the response.");
  }
  return text.substring(first, last + 1);
};

const Quizzes = ({ currentUser }) => {

  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [input, setInput] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isSharedQuiz, setIsSharedQuiz] = useState(false);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: '1',
    explanation: ''
  });
  const [showNotes, setShowNotes] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);

  // API key, speech recognition
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
   const API_KEY = 'Your OpenAI API Key'; // Replace with your actual API key
  const incorrectQuestionsFromState = location.state?.incorrectQuestions || [];


  useEffect(() => {
    const loadSharedQuiz = async () => {
      if (quizId) {
        setIsLoadingShared(true);
        try {
          const quizRef = ref(database, `quizzes/${quizId}`);
          const snapshot = await get(quizRef);
          if (snapshot.exists()) {
            setQuizData(snapshot.val());
            setIsSharedQuiz(true);
          } else {
            navigate('/quizzes', { replace: true });
          }
        } catch (error) {
          console.error('Error loading shared quiz:', error);
          navigate('/quizzes', { replace: true });
        } finally {
          setIsLoadingShared(false);
        }
      }
    };
    loadSharedQuiz();
  }, [quizId, navigate]);

  // mistake quiz generation
  useEffect(() => {
    if (!quizData && incorrectQuestionsFromState.length > 0) {
      generateQuizFromMistakes();
    }
  }, [incorrectQuestionsFromState]);

  // pdf parser
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
      setInput(doctext);
    };
    reader.readAsArrayBuffer(file);
  };

  // Generate and manage shareable quiz links
  const handleShare = async () => {
    if (!currentUser) {
      alert('Please login to share quizzes');
      return;
    }
    try {
      const newQuizId = uuidv4();
      const quizRef = ref(database, `quizzes/${newQuizId}`);
      // Save quiz data to Firebase
      await set(quizRef, {
        ...quizData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      });
      // share system
      const link = `${window.location.origin}/quizzes/${newQuizId}`;
      setShareableLink(link);
      navigator.clipboard.writeText(link);
      // alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing quiz:', error);
      alert('Error sharing quiz. Please try again.');
    }
  };


  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const quizContent = `
      <html>
        <head>
          <title>${quizData.quizTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .print-title { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 30px; }
            .question { margin: 25px 0; padding: 15px; border: 1px solid #ecf0f1; border-radius: 8px; background-color: #f9f9f9; }
            .answers { margin-left: 20px; margin-top: 10px; }
            .answer-key { margin-top: 40px; padding-top: 20px; border-top: 2px solid #3498db; }
            .answer-item { margin: 20px 0; padding: 15px; background-color: #f4f8fb; border-radius: 5px; }
            .explanation { color: #7f8c8d; font-style: italic; margin-top: 10px; }
            button { display: none; }
            h3 { color: #2c3e50; margin-bottom: 10px; }
            strong { color: #27ae60; }
          </style>
        </head>
        <body>
          <h1 class="print-title">${quizData.quizTitle}</h1>
          <h2>Questions</h2>
          ${quizData.questions.map((q, index) => `
            <div class="question">
              <h3>Question ${index + 1}: ${q.question}</h3>
              <div class="answers">
                ${q.answers.map((a, i) => `<div>${String.fromCharCode(65 + i)}. ${a}</div>`).join('')}
              </div>
            </div>
          `).join('')}
          <div class="answer-key">
            <h2>Answer Key</h2>
            ${quizData.questions.map((q, index) => `
              <div class="answer-item">
                <strong>Question ${index + 1}:</strong><br>
                Correct Answer: ${String.fromCharCode(64 + parseInt(q.correctAnswer))}<br>
                ${q.explanation ? `<div class="explanation"> Explanation: ${q.explanation}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>`;
    printWindow.document.write(quizContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Main quiz generation function using OpenAI API
  const generateQuiz = async () => {
    setLoading(true);

    const prompt = `Create a ${numQuestions} multiple-choice quiz about: ${input}. 
    Ensure that each question is unique and not repetitive.
    Use this JSON format:
    {
      "quizTitle": "Title",
      "quizSynopsis": "Synopsis",
      "questions": [{
        "question": "Q1",
        "questionType": "text",
        "answerSelectionType": "single",
        "answers": ["A", "B", "C", "D"],
        "correctAnswer": "1", // use 1 based indexing
        "explanation": "Explanation",
        "point": "1" 
      }]
    }`;
    try {

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const content = data.choices[0].message.content.trim();
      const jsonStr = extractJSON(content);
      const output = JSON.parse(jsonStr);
      

      if (customQuestions.length > 0) {
        output.questions = [...output.questions, ...customQuestions];
      }
      

      setQuizData(output);
      setInput('');
      setCustomQuestions([]);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz from previous incorrect answers
  const generateQuizFromMistakes = async () => {
    setLoading(true);
    // Combine incorrect questions into single string
    const joinedQuestions = incorrectQuestionsFromState.join('\n');
    const prompt = `Create a ${incorrectQuestionsFromState.length} multiple-choice quiz using the following questions (which were answered incorrectly) as a basis: 
${joinedQuestions}. 
Ensure each question is unique and not repetitive.
Use this JSON format:
{
  "quizTitle": "Title",
  "quizSynopsis": "Synopsis",
  "questions": [{
    "question": "Q1",
    "questionType": "text",
    "answerSelectionType": "single",
    "answers": ["A", "B", "C", "D"], 
    "correctAnswer": "1", use 1 based indexing
    "explanation": "Explanation",
    "point": "1" 
  }]
}`;
    try {
      // API call structure similar to generateQuiz
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      const content = data.choices[0].message.content.trim();
      const jsonStr = extractJSON(content);
      const output = JSON.parse(jsonStr);
      setQuizData(output);
    } catch (error) {
      console.error('Error generating quiz from mistakes:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz completion and save results
  const handleQuizComplete = async (obj) => {
    if (!currentUser) {
      alert('Please login to save quiz results');
      return;
    }

    const incrementViewCount = async (quizId) => {
      try {
        const quizRef = ref(database, `quizzes/${quizId}`);
        const snapshot = await get(quizRef);
        if (snapshot.exists()) {
          const currentViews = snapshot.val().viewCount || 0;
          await set(quizRef, {
            ...snapshot.val(),
            viewCount: currentViews + 1
          });
        }
      } catch (error) {
        console.error("Error updating view count:", error);
      }
    };

    setIsQuizCompleted(true);
    const timestamp = new Date().toISOString();
    
 
    const quizResult = {
      quizTitle: quizData.quizTitle,
      timestamp: timestamp,
      score: obj.correctPoints / obj.numberOfQuestions * 100,
      correctAnswers: obj.correctPoints,
      totalQuestions: obj.numberOfQuestions,
      questions: quizData.questions.map((q, index) => {

        const userAnswerIndex = parseInt(obj.userInput[index]) - 1;
        
        return {
          question: q.question,
          userAnswer: q.answers[userAnswerIndex],
          correctAnswer: q.answers[parseInt(q.correctAnswer) - 1],
          isCorrect: userAnswerIndex === (parseInt(q.correctAnswer) - 1),
          explanation: q.explanation || '',
          allAnswers: q.answers
        };
      })
    };

    try {

      const historyRef = ref(database, `users/${currentUser.uid}/quizResults/${Date.now()}`);
      await set(historyRef, quizResult);

 
      const answersRef = ref(database, `users/${currentUser.uid}/quizAnswers/${Date.now()}`);
      await set(answersRef, {
        quizTitle: quizData.quizTitle,
        timestamp: timestamp,
        questions: quizData.questions.map(q => ({
          question: q.question,
          answers: q.answers,
          correctAnswer: q.answers[parseInt(q.correctAnswer) - 1],
          explanation: q.explanation || ''
        }))
      });

      console.log('Quiz results and answers saved successfully');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      alert('Failed to save quiz results. Please try again.');
    }
  };


  const handleVoiceToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setInput(transcript);
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  // Custom question handling
  const handleAddQuestion = () => setShowAddQuestion(true);

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...newQuestion.answers];
    updatedAnswers[index] = value;
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const handleSaveQuestion = () => {
    if (!newQuestion.question || newQuestion.answers.some(a => !a)) {
      alert('Please fill out all fields');
      return;
    }

    const newCustomQuestion = {
      question: newQuestion.question,
      questionType: "text",
      answerSelectionType: "single",
      answers: newQuestion.answers,
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation || "Correct answer selected",
      point: "1"
    };
    
    setCustomQuestions([...customQuestions, newCustomQuestion]);
    setShowAddQuestion(false);
    setNewQuestion({
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: '1',
      explanation: ''
    });
  };

  // Navigation handlers
  const handleBackToInput = () => {
    setQuizData(null);
    setCustomQuestions([]);
    setIsQuizCompleted(false);
    setShareableLink('');
  };


  const renderCustomQuestionsList = () => {
    if (customQuestions.length === 0) return null;
    return (
      
      <div className="custom-questions-list">
        <h3>Custom Questions ({customQuestions.length})</h3>
        <ul>
          {customQuestions.map((q, index) => (
            <li key={index}>{q.question}</li>
          ))}
        </ul>
      </div>
    );
  };


  const renderInputSection = () => (
    <div className="input-container">
      {!showAddQuestion ? (
        <>
          <textarea
            className="quizzesdynamic-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text, upload a PDF, or use your voice to create a quiz."
          />
          <div className="button-group">
            <button
              className="quizzesaction-button"
              onClick={() => document.getElementById("pdfInput").click()}
              title="Upload PDF"
            >
              <img src={folderIcon} alt="Upload" />
            </button>

            <button
              className={`quizzesaction-button ${listening ? "active" : ""}`}
              onClick={handleVoiceToggle}
              title="Voice Input"
            >
              <img src={listening ? circleIcon : micIcon} alt="Voice" />
            </button>

            <button
              className="quizzesaction-button add-button"
              onClick={handleAddQuestion}
              title="Add Custom Question"
            >
              <img src={plusIcon} alt="Add Question" />
            </button>

            <button
              className="quizzesaction-button"
              onClick={generateQuiz}
              disabled={loading}
              title="Generate Quiz"
            >
              <img src={loadIcon} alt="Generate Quiz" />
            </button>

            {/* <button
              className="quizzesaction-button"
              onClick={() => navigate("/dashboard")}
              title="Exit"
            >
              <img src={exitIcon} alt="Exit" />
            </button> */}

            <div className="question-count">
              <input
                type="number"
                value={numQuestions}
                onChange={(e) =>
                  setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
              />
            </div>
          </div>

          <input
            id="pdfInput"
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              e.target.files[0] && handlePdfUpload(e.target.files[0])
            }
            style={{ display: "none" }}
          />

          {renderCustomQuestionsList()}
        </>
      ) : (
        <div className="add-question-form">
          <h2>Add Custom Question</h2>
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              placeholder="Enter your question"
            />
          </div>

          <div className="form-group">
            <label>Answers</label>
            {newQuestion.answers.map((answer, index) => (
              <div key={index} className="answer-input">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Answer ${index + 1}`}
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={newQuestion.correctAnswer === (index + 1).toString()}
                  onChange={() =>
                    setNewQuestion({
                      ...newQuestion,
                      correctAnswer: (index + 1).toString(),
                    })
                  }
                />
                <label>Correct</label>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Explanation (Optional)</label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, explanation: e.target.value })
              }
              placeholder="Explain why the correct answer is right"
            />
          </div>

          <div className="form-buttons">
            <button
              onClick={() => setShowAddQuestion(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button onClick={handleSaveQuestion} className="save-button">
              Save Question
            </button>
          </div>
        </div>
      )}
    </div>
  );


  const renderQuizSection = () => (
    <div className="quiz-display-section">
      <div className="quiz-and-notes-container">
        {/* <h1>{quizData?.quizTitle || "Generated Quiz"}</h1> */}
        <div className="custom-quiz">
          <Quiz
            quiz={quizData}
            onComplete={handleQuizComplete}
            showDefaultResult={true}
            allowNotes={true}
            currentUser={currentUser}
          />
        </div>

        {/* <button
          className="quizzesaction-button back-button"
          onClick={() => {
            if (quizData?.isRetake) {
              navigate(quizData.returnUrl || "/QuizHistory");
            } else {
              handleBackToInput();
            }
          }}
          title={quizData?.isRetake ? "Back to Quiz History" : "Back to Input"}
        >
          <img src={backIcon} alt="Back" />
        </button> */}
        {/* Note button positioned beside the quiz */}
        <button
          className={`quizzesaction-button note-toggle-button ${
            showNotes ? "active" : ""
          }`}
          onClick={() => setShowNotes(!showNotes)}
          title={showNotes ? "Hide Notes" : "My Notes"}
        >
          {/* <img src={notesIcon} alt="Notes" />  */}
          <img src={notesIcon} alt="QuizNotes" />                       
        </button>

        {/* Notes panel that appears beside the quiz */}
        {showNotes && (
          <div className="side-notes-panel">
            <NotesPanel currentUser={currentUser} />
          </div>
        )}
      </div>
      <div className="quizzes-actions">
        {isQuizCompleted && !quizData?.questions.some((q) => q.userAnswer) && (
          <>
            <button
              className="quizzesaction-button share-button"
              onClick={handleShare}
              title="Share Quiz"
            >
              <img src={shareIcon} alt="Share Quiz" />
            </button>
            <button
              className="quizzesaction-button print-button"
              onClick={handlePrint}
              title="Print/Download"
            >
              <img src={printIcon} alt="Print/Download" />
            </button>
          </>
        )}

        {/* <button
          className="quizzesaction-button"
          onClick={() => setShowNotes(!showNotes)}
          title={showNotes ? "Hide Notes" : "My Notes"}
        >
          <img src={notesIcon} alt="Notes" />
        </button> */}
      </div>

      {shareableLink && (
        <div className="share-link">
          <p>Shareable link:</p>
          <a href={shareableLink} target="_blank" rel="noopener noreferrer">
            {shareableLink}
          </a>
        </div>
      )}

      {/* {showNotes && (
        <div className="notes-panel-container">
          <NotesPanel currentUser={currentUser} />
        </div>
      )} */}
    </div>
  );
const [squizback, setQuizBack] = useState("");

// Modify your back button handler
const handleBackClick = () => {
  if (squizback) {
    setQuizBack(""); // Clear the quizback content if it exists
  } else if (quizData) {
    setQuizData(null); // Clear quiz data if we're viewing a quiz
    setCustomQuestions([]);
    setIsQuizCompleted(false);
    setShareableLink("");
  } else {
    navigate("/QuizHistory"); // Navigate to Dashboard if no content to clear
  }
};

  // Main render
  return (
    <div className="quiz-wrapper">
      <header>
        <button onClick={handleBackClick} className="quizzesback-button">
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



      </header>
      {isLoadingShared ? (
        <div className="quizzesloading-state">Loading shared quiz...</div>
      ) : loading ? (
        <div className="quizzesloading-state">Generating quiz...</div>
      ) : quizData ? (
        renderQuizSection()
      ) : (
        renderInputSection()
      )}
    </div>
  );
};

export default Quizzes;