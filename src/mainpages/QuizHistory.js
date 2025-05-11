import React, { useEffect, useState, useRef } from "react";
import { database } from "../config/firebase";
import {
  ref,
  onValue,
  query,
  orderByChild,
  set,
  remove,
  update,
  get,
} from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./QuizHistory.css";
import { FaStar } from "react-icons/fa";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const QuizHistory = ({ currentUser, isSidebarCollapsed }) => {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [searchedQuizId, setSearchedQuizId] = useState(null);
  const [sortedQuizResults, setSortedQuizResults] = useState([]);
  const [showingNotesForQuiz, setShowingNotesForQuiz] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const quizRefs = useRef({});

  const handleQuizClick = (result, e) => {
    e.stopPropagation();

    const quizForDetails = {
      title: result.quizTitle,
      synopsis: result.quizSynopsis || "",
      questions: result.questions.map((q) => ({
        questionText: q.question,
        answers: q.allAnswers || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "",
      })),
    };

    navigate(`/quizzesdetails/${result.id}`, {
      state: { quiz: quizForDetails },
    });
  };


  // Calculate chart data based on selected quizzes only
  const calculateChartData = () => {
    const selectedQuizzes = quizResults.filter((result) =>
      selectedQuizIds.includes(result.id)
    );

    const totalQuizzes = selectedQuizzes.length;
    const totalQuestions = selectedQuizzes.reduce(
      (sum, result) => sum + result.totalQuestions,
      0
    );
    const totalCorrect = selectedQuizzes.reduce(
      (sum, result) => sum + result.correctAnswers,
      0
    );
    const totalIncorrect = totalQuestions - totalCorrect;
    const overallPercentage =
      totalQuestions > 0
        ? ((totalCorrect / totalQuestions) * 100).toFixed(2)
        : 0;

    // New statistics (removed time-related stats)
    const highestScore = Math.max(
      ...selectedQuizzes.map((quiz) => Number(quiz.score))
    ).toFixed(2);
    const lowestScore = Math.min(
      ...selectedQuizzes.map((quiz) => Number(quiz.score))
    ).toFixed(2);

    return {
      performanceData: {
        labels: ["Correct\nQuestions", "Incorrect\nQuestions"],
        datasets: [
          {
            data: [totalCorrect, totalIncorrect],
            backgroundColor: ["#4CAF50", "#F44336"],
          },
        ],
      },
      statistics: {
        totalQuizzes,
        totalQuestions,
        overallPercentage,
        highestScore,
        lowestScore,
      },
    };
  };

  const { performanceData, statistics } = calculateChartData();

  // Store refs for each quiz item
  const setQuizRef = (id, element) => {
    if (element) {
      quizRefs.current[id] = element;
    }
  };

  // Load quiz results from Firebase
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const quizResultsRef = ref(
      database,
      `users/${currentUser.uid}/quizResults`
    );
    const resultsQuery = query(quizResultsRef, orderByChild("timestamp"));

    const unsubscribe = onValue(resultsQuery, (snapshot) => {
      setLoading(true);
      try {
        const resultsData = snapshot.val();
        if (resultsData) {
          const resultsList = Object.keys(resultsData).map((key) => ({
            id: key,
            ...resultsData[key],
          }));
          resultsList.sort((a, b) => {
            if (a.starred === b.starred) {
              return new Date(b.timestamp) - new Date(a.timestamp);
            }
            return a.starred ? -1 : 1;
          });
          setQuizResults(resultsList);
        } else {
          setQuizResults([]);
        }
      } catch (error) {
        setQuizResults([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Get the highlight parameter from URL
    const params = new URLSearchParams(location.search);
    const highlightId = params.get("highlight");
    
    if (highlightId) {
      setSearchedQuizId(highlightId);
    }
  }, [location.search]);

  useEffect(() => {
    if (searchedQuizId && !loading) {
      const element = quizRefs.current[searchedQuizId];
      if (element) {
        try {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          element.classList.add("highlight-quiz");
          setTimeout(() => {
            element.classList.remove("highlight-quiz");
          }, 2000);
          
          setSearchedQuizId(null);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        } catch (error) {
          console.error("Error scrolling to quiz:", error);
        }
      }
    }
  }, [searchedQuizId, loading, quizResults]);

  // Toggle quiz selection
  const toggleQuizSelection = (quizId) => {
    if (selectedQuizIds.includes(quizId)) {
      setSelectedQuizIds(selectedQuizIds.filter((id) => id !== quizId));
    } else {
      setSelectedQuizIds([...selectedQuizIds, quizId]);
    }
  };

  // Generate mistakes quiz using only selected quiz histories
  const handleGenerateFromMistakes = () => {
    if (selectedQuizIds.length === 0) {
      alert("Please select at least one quiz history.");
      return;
    }
    const incorrect = [];
    quizResults.forEach((result) => {
      if (selectedQuizIds.includes(result.id)) {
        result.questions.forEach((q) => {
          if (!q.isCorrect) {
            incorrect.push(q.question);
          }
        });
      }
    });
    const uniqueIncorrect = Array.from(new Set(incorrect));
    navigate("/quizzes", {
      state: { incorrectQuestions: uniqueIncorrect },
    });
  };

  const toggleQuizDetails = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  const convertToFlashcards = async () => {
    if (!currentUser || selectedQuizIds.length === 0) return;

    try {
      const selectedQuizzes = quizResults.filter((quiz) =>
        selectedQuizIds.includes(quiz.id)
      );

      // Create a Set to store unique questions and their answers
      const uniqueQuestions = new Map();
      let totalIncorrect = 0;

      // Collect unique incorrect questions from all selected quizzes
      selectedQuizzes.forEach((quiz) => {
        // Only get questions where isCorrect is explicitly false
        const quizIncorrect = quiz.questions.filter(
          (q) => q.isCorrect === false
        );
        totalIncorrect += quizIncorrect.length;

        quizIncorrect.forEach((q) => {
          uniqueQuestions.set(q.question, {
            question: q.question,
            answer: q.correctAnswer,
          });
        });
      });

      if (uniqueQuestions.size === 0) {
        alert("No incorrect answers to convert!");
        return;
      }

      // Check if a flashcard list with the same questions already exists
      const flashcardsRef = ref(
        database,
        `users/${currentUser.uid}/flashcard-lists`
      );
      const existingLists = await get(flashcardsRef);

      if (existingLists.exists()) {
        const lists = existingLists.val();
        const isDuplicate = Object.values(lists).some((list) => {
          if (!list.cards) return false;
          const listQuestions = Object.values(list.cards).map(
            (card) => card.question
          );
          const newQuestions = Array.from(uniqueQuestions.values()).map(
            (q) => q.question
          );
          return (
            JSON.stringify(listQuestions.sort()) ===
            JSON.stringify(newQuestions.sort())
          );
        });

        if (isDuplicate) {
          alert("A flashcard list with these questions already exists!");
          return;
        }
      }

      // Create new flashcard list
      const listId = Date.now();
      const newList = {
        id: listId,
        name: `Review: Selected Quizzes`,
        description: `Created from ${uniqueQuestions.size} unique incorrect answers (from ${totalIncorrect} total incorrect answers) in ${selectedQuizzes.length} selected quiz(es)`,
        createdAt: Date.now(),
        cards: {},
        starred: false,
      };

      // Convert Map entries to flashcards
      Array.from(uniqueQuestions.entries()).forEach(([_, value], index) => {
        newList.cards[`card_${index}`] = {
          id: `card_${index}`,
          question: value.question,
          answer: value.answer,
          createdAt: Date.now(),
        };
      });

      await set(
        ref(database, `users/${currentUser.uid}/flashcard-lists/${listId}`),
        newList
      );
      navigate(`/Dashboard/flashcards/${listId}`);
    } catch (error) {
      console.error("Error creating flashcards:", error);
      alert("Failed to create flashcards. Please try again.");
    }
  };

  const handleDeleteClick = (quizId, e) => {
    e.stopPropagation();
    setQuizToDelete(quizId);
    setShowDeleteConfirm(true);
  };

  const deleteQuiz = async () => {
    if (!currentUser || !quizToDelete) return;
    
    try {
      const quizRef = ref(
        database,
        `users/${currentUser.uid}/quizResults/${quizToDelete}`
      );
      await remove(quizRef);
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz. Please try again.");
    }
  };

  const handleTryAgain = async (result, e) => {
    e.stopPropagation();
    
    if (!currentUser) return;

    try {
      const newQuizId = Date.now().toString();
      const quizData = {
        quizTitle: `${result.quizTitle} (Retake)`,
        quizSynopsis: "Retake of previous quiz",
        nrOfQuestions: result.questions.length,
        allowBackButton: true,
        showInstantFeedback: true,
        showDefaultResult: true,
        continueTillCorrect: false,
        isRetake: true,
        allowNotes: true,
        questions: result.questions.map((q) => ({
          question: q.question,
          questionType: "text",
          answerSelectionType: "single",
          answers: q.allAnswers,
          correctAnswer: (q.allAnswers.indexOf(q.correctAnswer) + 1).toString(),
          explanation: q.explanation || "",
          point: "1",
        })),
        appLocale: {
          nextQuestionBtn: "Next",
          prevQuestionBtn: "Previous",
          resultPageHeaderText: "Quiz Results",
          resultPagePoint: "You scored",
          singleSelectionTagText: "Single Selection",
        },
        returnUrl: "/QuizHistory",
      };

      await set(ref(database, `quizzes/${newQuizId}`), {
        ...quizData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid,
      });

      navigate(`/quizzes/${newQuizId}`);
    } catch (error) {
      console.error("Error recreating quiz:", error);
      alert("Failed to start quiz. Please try again.");
    }
  };

  // Add these functions near your other state management functions
  const selectAllQuizzes = () => {
    const allQuizIds = quizResults.map((quiz) => quiz.id);
    setSelectedQuizIds(allQuizIds);
  };

  const deselectAllQuizzes = () => {
    setSelectedQuizIds([]);
  };

  // Add this function near the top of the component
  const maintainScrollPosition = (callback) => {
    const scrollPosition = window.pageYOffset;
    callback();
    window.scrollTo(0, scrollPosition);
  };

  // Update the toggle star function
  const toggleStar = async (quizId, isStarred, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    const quizRef = ref(
      database,
      `users/${currentUser.uid}/quizResults/${quizId}`
    );
    try {
      await update(quizRef, {
        starred: !isStarred,
      });
    } catch (error) {
      console.error("Error updating star status:", error);
    }
  };

  // Update the statistics section to be conditional
  const renderStatistics = () => {
    if (selectedQuizIds.length === 1) {
      // Show single quiz stats
      const quiz = quizResults.find((q) => q.id === selectedQuizIds[0]);
      return (
        <div className="statistics-grid single-quiz">
          <div className="stat-item">
            <span className="stat-label">Total Questions</span>
            <span className="stat-value">{quiz.totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total{"\n"}Score</span>
            <span className="stat-value">{Number(quiz.score).toFixed(2)}%</span>
          </div>
        </div>
      );
    }

    // Show multiple quiz stats
    return (
      <div className="statistics-grid">
        <div className="stat-item">
          <span className="stat-label">Quizzes Selected</span>
          <span className="stat-value">{statistics.totalQuizzes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Questions</span>
          <span className="stat-value">{statistics.totalQuestions}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">{statistics.overallPercentage}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Highest Score</span>
          <span className="stat-value">{statistics.highestScore}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Lowest Score</span>
          <span className="stat-value">{statistics.lowestScore}%</span>
        </div>
      </div>
    );
  };

  // Add this function to handle showing notes
  const handleShowNotes = (result, e) => {
    e.stopPropagation();
    navigate(`/quiznotes/${result.id}`);
  };

  return (
    <div
      className={`quiz-history-container ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <h2>Your Quiz History</h2>

      {/* Left Panel */}
      <div className="left-panel">
        {quizResults.length > 0 && (
          <div className="selection-buttons">
            <button className="select-all-btn" onClick={selectAllQuizzes}>
              Select All
      </button>
            <button className="deselect-all-btn" onClick={deselectAllQuizzes}>
              Deselect All
        </button>
          </div>
        )}

        {quizResults.length > 0 && selectedQuizIds.length === 0 && (
          <div className="selection-info">
            <p>Select quizzes to view their statistics</p>
          </div>
        )}

        {selectedQuizIds.length > 0 && (
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Performance Overview</h3>
              <Doughnut
                data={performanceData}
            options={{
                  plugins: {
                    legend: {
                      display: true,
                      position: "bottom",
                      align: "start",
                      labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: {
                          size: 12,
                        },
                        textAlign: "left",
                      },
                    },
                  },
                  layout: {
                    padding: {
                      bottom: 10,
                    },
                  },
            }}
          />
        </div>
            <div className="statistics-wrapper">
              <h3>Quiz Statistics</h3>
              {renderStatistics()}
            </div>

            {/* Move buttons inside charts container */}
            <div className="bottom-actions">
              <button
                className="generate-mistakes-button"
                onClick={handleGenerateFromMistakes}
              >
                Generate Quiz from Incorrect Answers
              </button>
              <button
                className="convert-flashcards-btn"
                onClick={convertToFlashcards}
              >
                Generate Flashcards from Incorrect Answers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="right-panel">
      {loading ? (
        <div className="loading">Loading quiz history...</div>
      ) : (
        <div className="quiz-results-list">
          {quizResults.length > 0 ? (
            quizResults.map((result) => (
              <div 
                key={result.id} 
                ref={(el) => setQuizRef(result.id, el)}
                id={`quiz-${result.id}`}
                  className={`quiz-result-item ${
                    result.starred ? "starred" : ""
                  }`}
                >
                  <div
                    className="quiz-summary"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuizSelection(result.id);
                    }}
                  >
                    <div className="quiz-summary-content">
                      <div className="quiz-header">
                        <h3>{result.quizTitle || "Untitled Quiz"}</h3>
                        <button
                          className={`star-button ${
                            result.starred ? "starred" : ""
                          }`}
                          onClick={(e) =>
                            toggleStar(result.id, result.starred, e)
                          }
                        >
                          <FaStar />
                        </button>
                      </div>
                      <p>
                        Score: {result.correctAnswers} / {result.totalQuestions}
                      </p>
                      <p>Percentage: {Number(result.score).toFixed(2)}%</p>
                  <p>Date: {new Date(result.timestamp).toLocaleString()}</p>
                  
                  {result.shareLink && (
                    <div className="share-link-container">
                      <button 
                        className="share-link-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(result.shareLink);
                        }}
                      >
                        Copy Share Link
                      </button>
                      <a 
                        href={result.shareLink} 
                        className="quiz-link"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        View Original Quiz
                      </a>
                    </div>
                  )}

                  <div className="quiz-actions">
                    <button
                      className="toggle-details-btn"
                      onClick={(e) => handleQuizClick(result, e)}
                    >
                      Show Details
                    </button>

                    <button 
                      className="show-notes-btn"
                      onClick={(e) => handleShowNotes(result, e)}
                    >
                      Show Notes
                    </button>

                    <button 
                      className="try-again-btn"
                      onClick={(e) => handleTryAgain(result, e)}
                    >
                      Try Again
                    </button>
                    <button 
                      className="delete-quiz-btn"
                      onClick={(e) => handleDeleteClick(result.id, e)}
                    >
                      Delete
                    </button>
                  </div>
                    </div>

                    {showingNotesForQuiz === result.id && (
                      <div className="quiz-notes-panel">
                        <ReactQuill
                          value={result.notes || ''}
                          onChange={(content) => {
                            // Update notes in Firebase
                            const quizRef = ref(database, `users/${currentUser.uid}/quizResults/${result.id}`);
                            update(quizRef, {
                              notes: content
                            });
                          }}
                          placeholder="Take notes about this quiz..."
                        />
                      </div>
                    )}

                    <input
                      type="checkbox"
                      className="quiz-checkbox"
                      checked={selectedQuizIds.includes(result.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleQuizSelection(result.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {expandedQuiz === result.id && result.questions && (
                  <div className="detailed-results">
                    <h4>Detailed Results:</h4>
                    {result.questions.map((q, index) => (
                        <div
                          key={index}
                          className={`question-result ${
                            q.isCorrect ? "correct" : "incorrect"
                          }`}
                        >
                        <p className="question-text">
                          <strong>Q{index + 1}:</strong> {q.question}
                        </p>
                        <p className="user-answer">
                            Your Answer:{" "}
                            <span
                              className={
                                q.isCorrect ? "correct-answer" : "wrong-answer"
                              }
                            >
                            {q.userAnswer}
                          </span>
                        </p>
                        {!q.isCorrect && (
                          <p className="correct-answer">
                            Correct Answer: {q.correctAnswer}
                          </p>
                        )}
                        {q.explanation && (
                          <p className="explanation">
                            Explanation: {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
                <p>
                  No quiz history found. Take a quiz to see your results here!
                </p>
            </div>
          )}
        </div>
      )}
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-popup">
            <h3>Delete Quiz</h3>
            <p>Are you sure you want to delete this quiz from your history?</p>
            <div className="delete-confirm-actions">
              <button 
                className="cancel-delete-btn"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setQuizToDelete(null);
                }}
              >
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={deleteQuiz}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory;